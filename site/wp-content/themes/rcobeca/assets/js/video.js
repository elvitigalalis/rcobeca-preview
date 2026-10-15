/**
 * YouTube poster and play button (Interactivity API; inc/video-facade.php).
 * The poster link becomes a button; pressing it puts the player
 * (youtube-nocookie.com) in its place, starts it and moves focus to it.
 * Without JavaScript the link opens the video on YouTube.
 */
import { store, getContext, getElement, withSyncEvent } from '@wordpress/interactivity';

store( 'rcobeca/video', {
	state: {
		role: 'button',
	},
	actions: {
		play: withSyncEvent( ( event ) => {
			event.preventDefault();
			getContext().playing = true;
		} ),
	},
	callbacks: {
		// Runs on the wrapper whenever "playing" changes; adds the player once.
		load() {
			const context = getContext();
			const { ref } = getElement();
			if ( ! context.playing || ref.querySelector( 'iframe' ) ) {
				return;
			}
			const player = document.createElement( 'iframe' );
			player.src = `https://www.youtube-nocookie.com/embed/${ context.video }?autoplay=1&rel=0`;
			player.title = context.title;
			player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
			player.allowFullscreen = true;
			player.referrerPolicy = 'strict-origin-when-cross-origin';
			player.className = 'rcobeca-video__player';
			ref.append( player );
			player.focus();
		},
	},
} );
