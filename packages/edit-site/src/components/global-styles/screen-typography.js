/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { __experimentalVStack as VStack } from '@wordpress/components';

/**
 * Internal dependencies
 */
import TypographyElements from './typography-elements';
import ScreenHeader from './header';
import TypesetButton from './typeset-button';

function ScreenTypography() {
	return (
		<>
			<ScreenHeader
				title={ __( 'Typography' ) }
				description={ __(
					'Typography styles and the application of those styles on site elements.'
				) }
			/>
			<div className="edit-site-global-styles-screen">
				<VStack spacing={ 7 }>
					<TypesetButton />
					<TypographyElements />
				</VStack>
			</div>
		</>
	);
}

export default ScreenTypography;
