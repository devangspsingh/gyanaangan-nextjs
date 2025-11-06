'use client';'use client';'use client';'use client';



import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';



export default function TiptapEditorWrapper({ content = '', onChange }) {import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

  return (

    <div className="w-full">

      <SimpleEditor 

        initialContent={content}export default function TiptapEditorWrapper({ content = '', onChange }) {import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

        onUpdate={(html) => onChange(html)}

      />  return (

    </div>

  );    <div className="w-full">

}

      <SimpleEditor 

        initialContent={content}// Wrapper component to match the existing interface// Wrapper component to match the existing interface

        onUpdate={(html) => onChange(html)}

      />export default function TiptapEditorWrapper({ content = '', onChange }) {export default function TiptapEditorWrapper({ content = '', onChange }) {

    </div>

  );  return (  return (

}

    <div className="w-full">    <div className="w-full">

      <SimpleEditor       <SimpleEditor 

        initialContent={content}        initialContent={content}

        onUpdate={(html) => onChange(html)}        onUpdate={(html) => onChange(html)}

      />      />

    </div>    </div>

  );  );

}}


// --- Toolbar Component ---
// We build a dedicated toolbar component that takes the editor instance

const TiptapToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return; // Cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  return (
    <div className="tiptap-toolbar">
      {/* History */}
      <Toggle size="sm" onPressedChange={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" onPressedChange={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="w-4 h-4" />
      </Toggle>

      <span className="toolbar-divider" />

      {/* Headings */}
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="w-4 h-4" />
      </Toggle>

      <span className="toolbar-divider" />

      {/* Formatting */}
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('highlight')} onPressedChange={() => editor.chain().focus().toggleHighlight().run()}>
        <Highlighter className="w-4 h-4" />
      </Toggle>

      <span className="toolbar-divider" />

      {/* Lists */}
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('taskList')} onPressedChange={() => editor.chain().focus().toggleTaskList().run()}>
        <ListTodo className="w-4 h-4" />
      </Toggle>

      <span className="toolbar-divider" />
      
      {/* Alignment */}
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}>
        <AlignJustify className="w-4 h-4" />
      </Toggle>

      <span className="toolbar-divider" />

      {/* Inserts */}
      <Toggle size="sm" pressed={editor.isActive('link')} onClick={setLink}>
        <LinkIcon className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" onClick={addImage}>
        <ImageIcon className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" onClick={addTable}>
        <TableIcon className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('blockquote')} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('code')} onPressedChange={() => editor.chain().focus().toggleCode().run()}>
        <CodeIcon className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('codeBlock')} onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 className="w-4 h-4" />
      </Toggle>
      <Toggle size="sm" onPressedChange={() => editor.chain().focus().setHardBreak().run()}>
        <WrapText className="w-4 h-4" />
      </Toggle>
    </div>
  );
};


// --- Main Editor Component ---

export default function TiptapEditor({ content, onChange }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const containerRef = useRef(null);
  
  // Tiptap Editor Instance
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        taskList: false, // We'll use TaskList extension instead
      }),
      Underline,
      Image,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        // This is what gives it the prose styling
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      // When in source view, update the source code as well
      if (showSource) {
        setSourceCode(html);
      }
    },
  });

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Toggle source code view
  const toggleSourceView = useCallback(() => {
    if (!editor) return;

    if (!showSource) {
      // Switch to source view
      const htmlContent = editor.getHTML();
      setSourceCode(htmlContent);
      setShowSource(true);
    } else {
      // Switch back to WYSIWYG view
      editor.commands.setContent(sourceCode);
      onChange(sourceCode);
      setShowSource(false);
    }
  }, [showSource, sourceCode, editor, onChange]);

  // Handle source code changes
  const handleSourceChange = useCallback((e) => {
    const newValue = e.target.value;
    setSourceCode(newValue);
    onChange(newValue);
  }, [onChange]);

  // Handle escape key for fullscreen exit
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

  // Update editor content if 'content' prop changes from outside
  useEffect(() => {
    if (editor && content !== editor.getHTML() && !showSource) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor, showSource]);
  
  // Cleanup editor
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <div
      ref={containerRef}
      className={`tiptap-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
    >
      {/* Custom Toolbar */}
      <div className="custom-editor-toolbar">
        <Button variant="outline" size="sm" onClick={toggleSourceView} className="gap-2">
          {showSource ? <Eye className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
          {showSource ? 'WYSIWYG View' : 'Source View'}
        </Button>
        <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-2">
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </div>

      {/* Editor or Source Code Area */}
      <div className="tiptap-content-wrapper">
        {showSource ? (
          <textarea
            className="source-code-textarea"
            value={sourceCode}
            onChange={handleSourceChange}
          />
        ) : (
          <>
            <TiptapToolbar editor={editor} />
            <EditorContent editor={editor} className="tiptap-editor-content" />
          </>
        )}
      </div>

      {/* Tiptap uses CSS for styling, so we must add it.
          This includes the default prose styles AND table styles. */}
      <style jsx global>{`
        /* --- Main Container --- */
        .tiptap-container {
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          overflow: hidden;
          background: hsl(var(--background));
          display: flex;
          flex-direction: column;
        }
        
        /* --- Custom Toolbar (Fullscreen/Source) --- */
        .custom-editor-toolbar {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 0.5rem;
          background: hsl(var(--muted));
          border-bottom: 1px solid hsl(var(--border));
        }

        /* --- Tiptap Toolbar --- */
        .tiptap-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          padding: 0.5rem;
          border-bottom: 1px solid hsl(var(--border));
        }
        .toolbar-divider {
          width: 1px;
          background-color: hsl(var(--border));
          margin: 0.25rem 0.5rem;
        }

        /* --- Content Area --- */
        .tiptap-content-wrapper {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .tiptap-editor-content {
          flex-grow: 1;
          padding: 1rem;
          overflow-y: auto;
          min-height: 400px;
          max-height: 600px;
        }
        .tiptap-editor-content .ProseMirror {
          min-height: 100%;
        }

        /* --- Fullscreen Mode --- */
        .fullscreen-mode {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          border-radius: 0;
          border: none;
        }
        .fullscreen-mode .tiptap-content-wrapper {
             height: 0; /* Allows flex-grow to work */
        }
        .fullscreen-mode .tiptap-editor-content {
            max-height: none;
        }

        /* --- Source Code Textarea --- */
        .source-code-textarea {
          width: 100%;
          flex-grow: 1;
          min-height: 400px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.875rem;
          background: #1f2937; /* You can use CSS variables here too */
          color: #f9fafb;
          border: none;
          padding: 1rem;
          resize: none;
          outline: none;
        }
        .dark .source-code-textarea {
            background: #111827;
        }
        
        /* --- Tiptap Specific Styles --- */
        .ProseMirror:focus {
          outline: none;
        }

        /* Task list styles */
        ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        ul[data-type="taskList"] li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin: 0; /* Reset prose styles */
        }
        ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
          margin: 0; /* Reset prose styles */
        }

        /* Code Block styles */
        pre {
          background: #0D0D0D;
          color: #FFF;
          font-family: 'JetBrainsMono', monospace;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
        }
        pre code {
          color: inherit;
          padding: 0;
          background: none;
          font-size: 0.8rem;
        }
        pre .hljs-comment,
        pre .hljs-quote {
          color: #616161;
        }
        pre .hljs-variable,
        pre .hljs-template-variable,
        pre .hljs-attribute,
        pre .hljs-tag,
        pre .hljs-name,
        pre .hljs-regexp,
        pre .hljs-link,
        pre .hljs-name,
        pre .hljs-selector-id,
        pre .hljs-selector-class {
          color: #F98181;
        }

        /* --- Table Styles (VERY IMPORTANT) --- */
        .ProseMirror table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          overflow: hidden;
          margin: 1.5em 0;
        }
        .ProseMirror th, .ProseMirror td {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem 0.75rem;
          vertical-align: top;
          position: relative;
        }
        .ProseMirror th {
          background-color: hsl(var(--muted));
          font-weight: bold;
          text-align: left;
        }
        .ProseMirror .selectedCell:after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(37, 99, 235, 0.1); /* blue-600 with 10% opacity */
          pointer-events: none;
          z-index: 2;
        }
        .ProseMirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #adf;
          cursor: col-resize;
          z-index: 20;
        }
        .ProseMirror.resize-cursor {
          cursor: col-resize;
        }
      `}</style>
    </div>
  );
}