import React, { useState } from 'react';
import { 
  FileCode, Copy, Check, Terminal, FolderTree, Sparkles, Search, 
  Download, Layers, BookOpen, ExternalLink, ChevronRight
} from 'lucide-react';
import { DART_FILES, FLUTTER_PROJECT_MODULES } from '../data/flutterProjectData';
import { DartCodeFile } from '../types';

interface CodeExplorerProps {
  activeModuleId: number;
  onSelectModule: (id: number) => void;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({
  activeModuleId,
  onSelectModule,
}) => {
  const [selectedFile, setSelectedFile] = useState<DartCodeFile>(DART_FILES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Filter files by module or search
  const filteredFiles = DART_FILES.filter((file) => {
    if (searchQuery.trim()) {
      return (
        file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.filePath.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return file.module === activeModuleId;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Module Selector Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              Flutter & Firebase Dart Kod Gezgini
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">
            Dart 3.x Null-Safe
          </span>
        </div>

        {/* Module Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {FLUTTER_PROJECT_MODULES.map((mod) => (
            <button
              key={mod.id}
              id={`module-tab-btn-${mod.id}`}
              onClick={() => {
                onSelectModule(mod.id);
                const firstFileInMod = DART_FILES.find((f) => f.module === mod.id);
                if (firstFileInMod) setSelectedFile(firstFileInMod);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeModuleId === mod.id
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>Modül {mod.id}</span>
              <span className="text-[10px] opacity-80 truncate max-w-[120px]">
                {mod.title.split(':')[1]?.trim() || ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Code View Area */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left Sidebar: File List & Module Info */}
        <div className="w-full lg:w-72 bg-slate-950/50 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 flex flex-col gap-3 shrink-0">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              id="input-code-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dosya veya kod ara..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* File item list */}
          <div className="space-y-1 overflow-y-auto max-h-48 lg:max-h-none flex-1 pr-1">
            <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
              {searchQuery ? 'Arama Sonuçları' : `Modül ${activeModuleId} Dosyaları`}
            </div>

            {filteredFiles.map((file) => {
              const isSelected = selectedFile.filePath === file.filePath;
              return (
                <button
                  key={file.filePath}
                  id={`file-btn-${file.fileName.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.fileName}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100 text-teal-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Module description card */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5 hidden lg:block">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mimari Notu</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {selectedFile.description}
            </p>
          </div>
        </div>

        {/* Right Area: Code Editor / Viewer */}
        <div className="flex-1 flex flex-col bg-slate-950 min-h-0">
          {/* File Header Toolbar */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-xs font-mono font-semibold text-slate-200 ml-2">
                {selectedFile.filePath}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-download-file"
                onClick={handleDownload}
                title="Dosyayı İndir"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                id="btn-copy-dart-code"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
              </button>
            </div>
          </div>

          {/* Highlights bar */}
          <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/70 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium">Önemli Noktalar:</span>
            {selectedFile.highlights.map((h, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-slate-800 text-teal-300 rounded-md font-mono text-[10px] whitespace-nowrap border border-slate-700/60"
              >
                {h}
              </span>
            ))}
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-['Fira_Code',monospace] text-xs leading-relaxed text-slate-200 bg-slate-950">
            <pre className="flex">
              <code className="text-slate-600 select-none pr-4 text-right border-r border-slate-800/80 mr-4">
                {selectedFile.code.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </code>
              <code className="flex-1 text-slate-200 whitespace-pre overflow-x-auto">
                {selectedFile.code}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
