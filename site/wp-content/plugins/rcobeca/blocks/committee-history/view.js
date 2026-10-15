/**
 * Committee history name search (Interactivity API): hides the Club Years in
 * which the typed name does not appear and announces how many remain.
 */
import { store, getContext } from '@wordpress/interactivity';

const { state } = store( 'rcobeca/committee-history', {
	state: {
		get isHidden() {
			return '' !== state.query && ! getContext().names.includes( state.query );
		},
		get count() {
			if ( '' === state.query ) {
				return '';
			}
			const found = state.names.filter( ( names ) => names.includes( state.query ) ).length;
			return 1 === found ? '1 Club Year' : `${ found } Club Years`;
		},
	},
	actions: {
		search( event ) {
			state.query = event.target.value.trim().toLowerCase().replace( /\s+/g, ' ' );
		},
	},
} );
