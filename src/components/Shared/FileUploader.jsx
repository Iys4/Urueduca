import React, { useRef, useState } from 'react';

const fileTypeIcons = {
    pdf: { icon: 'picture_as_pdf', color: 'text-error' },
    doc: { icon: 'description', color: 'text-primary' },
    image: { icon: 'image', color: 'text-tertiary' },
    other: { icon: 'attach_file', color: 'text-outline' },
};

const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx', 'pptx', 'ppt', 'odt'].includes(ext)) return 'doc';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
    return 'other';
};

const FileUploader = ({ files = [], onChange, maxFiles = 10, accept, label = 'Subir documentos' }) => {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = (newFiles) => {
        const fileArray = Array.from(newFiles).map(f => ({
            name: f.name,
            type: getFileType(f.name),
            size: f.size < 1024 * 1024
                ? `${Math.round(f.size / 1024)} KB`
                : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        }));
        const combined = [...files, ...fileArray].slice(0, maxFiles);
        onChange(combined);
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
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</label>

            {/* Drop zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setIsDragging(false)}
                className={`
                    flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-dashed cursor-pointer
                    transition-all duration-200
                    ${isDragging
                        ? 'border-primary bg-primary-fixed/30 scale-[1.01]'
                        : 'border-outline-variant bg-surface-container/30 hover:border-primary/50 hover:bg-surface-container/60'
                    }
                `}
            >
                <span className={`material-symbols-outlined text-[32px] mb-2 ${isDragging ? 'text-primary' : 'text-outline'}`}>
                    cloud_upload
                </span>
                <p className="text-sm font-medium text-on-surface-variant">
                    Arrastrá archivos aquí o <span className="text-primary font-semibold">buscá en tu equipo</span>
                </p>
                <p className="text-[11px] text-outline mt-1">PDF, DOC, imágenes — máx. {maxFiles} archivos</p>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={accept}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                />
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-1.5">
                    {files.map((file, idx) => {
                        const ft = fileTypeIcons[file.type] || fileTypeIcons.other;
                        return (
                            <div
                                key={`${file.name}-${idx}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container/50 group"
                            >
                                <span className={`material-symbols-outlined text-[18px] ${ft.color}`}>{ft.icon}</span>
                                <span className="text-sm text-on-surface truncate flex-1">{file.name}</span>
                                <span className="text-[11px] text-outline shrink-0">{file.size}</span>
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
