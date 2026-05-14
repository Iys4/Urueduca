import React, { useRef, useState } from 'react';

const fileTypeIcons = {
    pdf: { icon: 'picture_as_pdf', color: 'text-error' },
    doc: { icon: 'description', color: 'text-primary' },
    image: { icon: 'image', color: 'text-tertiary' },
    link: { icon: 'link', color: 'text-info' },
    text: { icon: 'article', color: 'text-secondary' },
    other: { icon: 'attach_file', color: 'text-outline' },
};

const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx', 'pptx', 'ppt', 'odt'].includes(ext)) return 'doc';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
    return 'other';
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const FileUploader = ({ files = [], onChange, maxFiles = 10, accept, label = 'Subir documentos' }) => {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [addMode, setAddMode] = useState(null); // null | 'link' | 'text'
    const [linkUrl, setLinkUrl] = useState('');
    const [linkTitle, setLinkTitle] = useState('');
    const [textTitle, setTextTitle] = useState('');
    const [textContent, setTextContent] = useState('');

    const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFiles = async (newFiles) => {
        setError('');
        const fileArray = [];
        
        for (const f of Array.from(newFiles)) {
            if (f.size > MAX_FILE_SIZE) {
                setError(`"${f.name}" excede el límite de 5MB y fue omitido.`);
                continue;
            }
            try {
                const base64 = await readFileAsBase64(f);
                fileArray.push({
                    name: f.name,
                    type: getFileType(f.name),
                    resourceType: 'file',
                    size: f.size < 1024 * 1024
                        ? `${Math.round(f.size / 1024)} KB`
                        : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                    mimeType: f.type,
                    data: base64,
                    addedAt: new Date().toISOString(),
                });
            } catch (err) {
                setError(`Error leyendo "${f.name}".`);
            }
        }
        
        const combined = [...files, ...fileArray].slice(0, maxFiles);
        onChange(combined);
    };

    const handleAddLink = () => {
        if (!linkUrl.trim()) return;
        const newLink = {
            name: linkTitle.trim() || linkUrl.trim(),
            type: 'link',
            resourceType: 'link',
            size: '-',
            url: linkUrl.trim(),
            addedAt: new Date().toISOString(),
        };
        onChange([...files, newLink].slice(0, maxFiles));
        setLinkUrl('');
        setLinkTitle('');
        setAddMode(null);
    };

    const handleAddText = () => {
        if (!textContent.trim()) return;
        const newText = {
            name: textTitle.trim() || 'Nota de texto',
            type: 'text',
            resourceType: 'text',
            size: `${textContent.length} chars`,
            content: textContent.trim(),
            addedAt: new Date().toISOString(),
        };
        onChange([...files, newText].slice(0, maxFiles));
        setTextTitle('');
        setTextContent('');
        setAddMode(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
    };

    return (
        <div className="space-y-3">
            {label && <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</label>}

            {/* Action buttons to add different types */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:border-primary/50 transition-all"
                >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    Subir Archivo
                </button>
                <button
                    type="button"
                    onClick={() => setAddMode(addMode === 'link' ? null : 'link')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        addMode === 'link' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:border-primary/50'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">link</span>
                    Agregar Link
                </button>
                <button
                    type="button"
                    onClick={() => setAddMode(addMode === 'text' ? null : 'text')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        addMode === 'text' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:border-primary/50'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">article</span>
                    Agregar Texto
                </button>
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={accept}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
            />

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setIsDragging(false)}
                className={`
                    flex flex-col items-center justify-center py-5 px-4 rounded-xl border-2 border-dashed cursor-pointer
                    transition-all duration-200
                    ${isDragging
                        ? 'border-primary bg-primary-fixed/30 scale-[1.01]'
                        : 'border-outline-variant bg-surface-container/30 hover:border-primary/50 hover:bg-surface-container/60'
                    }
                `}
                onClick={() => inputRef.current?.click()}
            >
                <span className={`material-symbols-outlined text-[28px] mb-1 ${isDragging ? 'text-primary' : 'text-outline'}`}>
                    cloud_upload
                </span>
                <p className="text-sm font-medium text-on-surface-variant">
                    Arrastrá archivos aquí o <span className="text-primary font-semibold">buscá en tu equipo</span>
                </p>
                <p className="text-[11px] text-outline mt-1">PDF, DOC, imágenes — máx. 5MB por archivo, {maxFiles} recursos en total</p>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 text-xs text-error bg-error-container/20 px-3 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    {error}
                </div>
            )}

            {/* Link input form */}
            {addMode === 'link' && (
                <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Agregar Enlace</h4>
                    <input
                        type="text"
                        placeholder="Título (opcional)"
                        value={linkTitle}
                        onChange={e => setLinkTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                    />
                    <input
                        type="url"
                        placeholder="https://ejemplo.com/recurso"
                        value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setAddMode(null)} className="px-3 py-1.5 text-xs font-medium text-secondary hover:text-on-surface rounded-lg transition-colors">Cancelar</button>
                        <button type="button" onClick={handleAddLink} disabled={!linkUrl.trim()} className="px-3 py-1.5 text-xs font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50">Agregar</button>
                    </div>
                </div>
            )}

            {/* Text input form */}
            {addMode === 'text' && (
                <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Agregar Material de Texto</h4>
                    <input
                        type="text"
                        placeholder="Título del material"
                        value={textTitle}
                        onChange={e => setTextTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                        autoFocus
                    />
                    <textarea
                        placeholder="Escribí tu contenido aquí... Apuntes, resúmenes, instrucciones, etc."
                        value={textContent}
                        onChange={e => setTextContent(e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setAddMode(null)} className="px-3 py-1.5 text-xs font-medium text-secondary hover:text-on-surface rounded-lg transition-colors">Cancelar</button>
                        <button type="button" onClick={handleAddText} disabled={!textContent.trim()} className="px-3 py-1.5 text-xs font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50">Agregar</button>
                    </div>
                </div>
            )}

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-1.5">
                    {files.map((file, idx) => {
                        const ft = fileTypeIcons[file.type] || fileTypeIcons.other;
                        return (
                            <div
                                key={`${file.name}-${idx}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-container/50 group hover:bg-surface-container/70 transition-colors"
                            >
                                <div className={`w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0`}>
                                    <span className={`material-symbols-outlined text-[18px] ${ft.color}`}>{ft.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-on-surface truncate font-medium">{file.name}</p>
                                    <p className="text-[10px] text-outline">
                                        {file.resourceType === 'link' ? file.url : file.resourceType === 'text' ? 'Material de texto' : file.size}
                                    </p>
                                </div>
                                <span className="text-[10px] text-outline shrink-0 uppercase font-bold tracking-wider">
                                    {file.resourceType || 'file'}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/40 transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label={`Eliminar ${file.name}`}
                                >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FileUploader;
