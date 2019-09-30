( function( wp ) {
    var el = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var TextControl = wp.components.TextControl;
 
    registerBlockType( 'test/meta-block', {
        title: 'Meta Block',
        icon: 'smiley',
        category: 'common',
 
        attributes: {
            blockValue: {
                type: 'email',
                source: 'meta',
                meta: 'test_meta_block_field'
            }
        },
 
        edit: function( props ) {
            var className = props.className;
            var setAttributes = props.setAttributes;
 
            function updateBlockValue( blockValue ) {
                setAttributes({ blockValue });
            }
 
            return el(
                'div',
                { className: className },
                el( TextControl, {
                    type:'email',
                    label: 'Email:',
                    value: props.attributes.blockValue,
                    onChange: updateBlockValue
                } )
            );
        },
 
        save: function() {
            return null;
        }
    } );
} )( window.wp );