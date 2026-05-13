import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { resetDatabase } from '../../data/db';

const DevPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const store = useAppStore();

    if (import.meta.env.PROD) return null; // Hidden in production

    const handleReset = async () => {
        if (!window.confirm("¿Seguro que quieres borrar toda la base de datos IndexedDB? Esto recargará la página.")) return;
        await resetDatabase();
        window.location.reload();
    };

    return (
        <div className="fixed bottom-4 left-4 z-[9999] font-mono">
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-black text-green-400 px-3 py-1 text-xs rounded opacity-50 hover:opacity-100"
                >
                    DEV
                </button>
            ) : (
                <div className="bg-black text-green-400 p-4 text-xs rounded shadow-lg max-w-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-green-800 pb-2">
                        <span className="font-bold">Dev Panel - IndexedDB</span>
                        <button onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-300">Cerrar</button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <strong>Estado actual:</strong><br />
                            Cursos: {store.courses.length}<br />
                            Módulos: {store.modules.length}<br />
                            Clases: {store.lessons.length}<br />
                            Estudiantes: {store.students.length}
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={handleReset}
                                className="bg-red-900 text-white px-2 py-1 rounded hover:bg-red-800 flex-1"
                            >
                                Reset DB (Nuke)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevPanel;
