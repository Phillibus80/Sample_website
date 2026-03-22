import {useCallback} from 'react';

import PropTypes from 'prop-types';
import {Button, ButtonGroup, ButtonToolbar} from 'react-bootstrap';
import {
    FaBold,
    FaIndent,
    FaItalic,
    FaLink,
    FaListOl,
    FaListUl,
    FaOutdent,
    FaUnderline
} from 'react-icons/fa';
import {LuHeading1, LuHeading2} from 'react-icons/lu';

import {indent, outdent, toggleBlock, toggleInline, toggleList} from './rich-text-commands.js';

const COMMANDS = {
    bold: (el) => toggleInline(el, 'strong'),
    italic: (el) => toggleInline(el, 'em'),
    underline: (el) => toggleInline(el, 'u'),
    heading: (el) => toggleBlock(el, 'h3'),
    subheading: (el) => toggleBlock(el, 'h4'),
    bulletList: (el) => toggleList(el, 'ul'),
    numberedList: (el) => toggleList(el, 'ol'),
    indent: indent,
    outdent: outdent
};

const BUTTON_GROUPS = [
    [
        {cmd: 'bold', title: 'Bold', Icon: FaBold},
        {cmd: 'italic', title: 'Italic', Icon: FaItalic},
        {cmd: 'underline', title: 'Underline', Icon: FaUnderline}
    ],
    [
        {cmd: 'heading', title: 'Heading', Icon: LuHeading1},
        {cmd: 'subheading', title: 'Subheading', Icon: LuHeading2}
    ],
    [
        {cmd: 'bulletList', title: 'Bullet list', Icon: FaListUl},
        {cmd: 'numberedList', title: 'Numbered list', Icon: FaListOl}
    ],
    [
        {cmd: 'indent', title: 'Indent', Icon: FaIndent},
        {cmd: 'outdent', title: 'Outdent', Icon: FaOutdent}
    ]
];

/**
 * Formatting toolbar for the rich text editor. Each button applies a
 * Selection/Range command to the contentEditable referenced by editorRef.
 *
 * @param {object} editorRef - React ref pointing to the contentEditable div
 * @param {function} onContentChange - fired after any formatting command
 * @param {function} onLinkClick - opens the link insertion modal
 * @return {React.ReactNode}
 */
const RichTextToolbar = ({editorRef, onContentChange, onLinkClick}) => {
    const handleCommand = useCallback((e, cmdName) => {
        // preventDefault keeps the text selection from collapsing when
        // the button steals focus on mousedown.
        e.preventDefault();
        const el = editorRef.current;
        if (!el) return;
        COMMANDS[cmdName](el);
        onContentChange();
    }, [editorRef, onContentChange]);

    const handleLink = useCallback((e) => {
        e.preventDefault();
        onLinkClick();
    }, [onLinkClick]);

    return (
        <ButtonToolbar className='mb-2 gap-2'>
            {BUTTON_GROUPS.map((group, gi) => (
                <ButtonGroup key={gi}>
                    {group.map(({cmd, title, Icon}) => (
                        <Button
                            key={cmd}
                            variant='outline-secondary'
                            size='sm'
                            title={title}
                            onMouseDown={(e) => handleCommand(e, cmd)}
                        >
                            <Icon/>
                        </Button>
                    ))}
                </ButtonGroup>
            ))}
            <ButtonGroup>
                <Button
                    variant='outline-secondary'
                    size='sm'
                    title='Insert link'
                    onMouseDown={handleLink}
                >
                    <FaLink/>
                </Button>
            </ButtonGroup>
        </ButtonToolbar>
    );
};

RichTextToolbar.propTypes = {
    editorRef: PropTypes.shape({current: PropTypes.instanceOf(Element)}).isRequired,
    onContentChange: PropTypes.func.isRequired,
    onLinkClick: PropTypes.func.isRequired
};

export default RichTextToolbar;
