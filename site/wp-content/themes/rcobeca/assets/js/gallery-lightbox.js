/**
 * Galleries marked .rcobeca-lightbox (Gallery blocks whose images link to
 * their media files) open in a PhotoSwipe viewer (Interactivity API; each
 * photo link has data-wp-on--click="actions.open", inc/gallery-lightbox.php;
 * so does a long gallery's "See all" button, which opens at the first hidden photo).
 * Arrow keys move, Escape closes, focus is trapped while open and returns to
 * the photo afterwards. The viewer code loads only on first open; without
 * JavaScript a link opens the photo itself.
 */
import { store, getElement, withSyncEvent } from '@wordpress/interactivity';

/** One slide per photo link of the gallery: the full-size file, its size, alt text and caption. */
const slides = ( gallery ) =>
	[ ...gallery.querySelectorAll( '.wp-block-image > a' ) ].map( ( link ) => {
		const img = link.querySelector( 'img' );
		const caption = link.closest( 'figure' )?.querySelector( 'figcaption' );
		return {
			element: link,
			src: link.href,
			msrc: img?.currentSrc || img?.src,
			// The server adds each photo's full size; fall back to the thumbnail's own size.
			width: Number( link.dataset.pswpWidth ) || img?.naturalWidth || 1200,
			height: Number( link.dataset.pswpHeight ) || img?.naturalHeight || 800,
			alt: img?.alt || '',
			caption: caption ? caption.textContent.trim() : '',
		};
	} );

/** PhotoSwipe's root is role="dialog": name it, make it modal, and keep Tab inside it. */
const makeModal = ( pswp ) => {
	const root = pswp.element;
	root.setAttribute( 'aria-modal', 'true' );
	root.setAttribute( 'aria-label', 'Photo viewer' );
	// PhotoSwipe pulls focus back only once it lands on the page; Tab past the
	// last control would otherwise leave the dialog. Wrap it instead.
	root.addEventListener( 'keydown', ( event ) => {
		if ( event.key !== 'Tab' ) {
			return;
		}
		const controls = [ ...root.querySelectorAll( 'button' ) ].filter( ( button ) => button.offsetParent !== null && ! button.disabled );
		if ( ! controls.length ) {
			return;
		}
		const firstControl = controls[ 0 ];
		const lastControl = controls[ controls.length - 1 ];
		const active = root.ownerDocument.activeElement;
		if ( event.shiftKey && ( active === firstControl || active === root ) ) {
			event.preventDefault();
			lastControl.focus();
		} else if ( ! event.shiftKey && active === lastControl ) {
			event.preventDefault();
			firstControl.focus();
		}
	} );
};

/** A live caption under the photo, read out as the slide changes. */
const addCaption = ( pswp ) => {
	pswp.ui.registerElement( {
		name: 'caption',
		order: 9,
		isButton: false,
		appendTo: 'root',
		onInit: ( el ) => {
			el.setAttribute( 'aria-live', 'polite' );
			pswp.on( 'change', () => {
				el.textContent = pswp.currSlide?.data.caption || '';
				el.hidden = ! el.textContent;
			} );
		},
	} );
};

store( 'rcobeca/lightbox', {
	actions: {
		open: withSyncEvent( function* ( event ) {
			// A click meant for a new tab or window keeps its usual meaning.
			if ( event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
				return;
			}
			event.preventDefault();
			const { ref } = getElement();
			const dataSource = slides( ref.closest( '.rcobeca-lightbox' ) );
			// A photo opens at itself; "See all" (data-start) at the first photo the grid hides.
			const start = ref.dataset.start ? Number( ref.dataset.start ) : dataSource.findIndex( ( slide ) => slide.element === ref );
			const { default: PhotoSwipe } = yield import( '../vendor/photoswipe/photoswipe.esm.min.js' );
			const pswp = new PhotoSwipe( {
				dataSource,
				index: Math.max( 0, Math.min( start, dataSource.length - 1 ) ),
				bgOpacity: 0.97,
				showHideAnimationType: 'fade',
				closeTitle: 'Close (Esc)',
				zoomTitle: 'Zoom',
				arrowPrevTitle: 'Previous photo',
				arrowNextTitle: 'Next photo',
				errorMsg: 'This photo could not be loaded.',
			} );
			pswp.on( 'uiRegister', () => addCaption( pswp ) );
			pswp.on( 'afterInit', () => makeModal( pswp ) );
			pswp.init();
		} ),
	},
} );
