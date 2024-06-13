/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { store as editorStore } from '@wordpress/editor';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import TypographyElements from './typography-elements';
import FontFamilies from './font-families';
import ScreenHeader from './header';
import TypesetButton from './typeset-button';

function ScreenTypography() {
	const fontLibraryEnabled = useSelect(
		( select ) =>
			select( editorStore ).getEditorSettings().fontLibraryEnabled,
		[]
	);

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
					{ ! window.__experimentalDisableFontLibrary &&
						fontLibraryEnabled && <FontFamilies /> }
					<TypographyElements />
				</VStack>
			</div>
		</>
	);
}

export default ScreenTypography;
