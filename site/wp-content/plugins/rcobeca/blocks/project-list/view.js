/**
 * Projects "Show more" (Interactivity API). Without JavaScript the button is
 * a link to the next page of the same filtered listing; here it fetches that
 * page, adds its cards to the grid, points itself at the page after (or goes
 * away on the last one), updates the count and moves focus to the first new
 * card.
 */
import { store, getElement, withSyncEvent } from '@wordpress/interactivity';

const showMore = async ( link ) => {
	const list = link.closest( '.rcobeca-project-list' );
	const grid = list.querySelector( '.rcobeca-project-grid' );
	const response = await fetch( link.href, { credentials: 'same-origin' } );
	if ( ! response.ok ) {
		window.location.href = link.href;
		return;
	}
	const next = new DOMParser().parseFromString( await response.text(), 'text/html' ).querySelector( '.rcobeca-project-list' );
	const cards = [ ...( next?.querySelectorAll( '.rcobeca-project-grid > li' ) ?? [] ) ];
	grid.append( ...cards );

	const after = next?.querySelector( '.rcobeca-project-list__more a' );
	if ( after ) {
		link.href = after.href;
	} else {
		link.parentElement.remove();
	}
	list.querySelector( '.rcobeca-project-list__shown' ).textContent = `Showing ${ grid.children.length } of ${ list.dataset.total } Projects`;
	cards[ 0 ]?.querySelector( 'h3 a' )?.focus();
};

store( 'rcobeca/project-list', {
	actions: {
		more: withSyncEvent( ( event ) => {
			event.preventDefault();
			showMore( getElement().ref );
		} ),
	},
} );
