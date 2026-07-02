$src = "d:/smart-household-energy/src/pages/BillAnalyzer.tsx"
$lines = Get-Content $src -Encoding utf8

# Part 1: lines 1-720 (clean, up to end of toast section)
$part1 = $lines[0..719]

# Part 2: lines 971 onwards (MAIN RESULTS GRID and rest)
$part2 = $lines[970..($lines.Length - 1)]

# The clean upload section to inject between part1 and part2
$middle = @'

      {/* ─── UPLOADER ROW ─────────────────────────────────────────────────────── */}
      <div className="flex justify-center print:hidden">
        
        {/* Upload card — full-width centered */}
        <div className="w-full max-w-2xl space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center space-y-4"
          >
            <h3 className="text-sm font-display font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 justify-center">
              <Upload className="w-4.5 h-4.5 text-primary-blue dark:text-primary-green" />
              Upload Utility Bill
            </h3>

            {/* Drop zone — shows preview inline after file selected */}
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-blue/30 dark:hover:border-primary-green/30 transition-all group relative overflow-hidden min-h-[200px]">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              {previewUrl ? (
                isPdf ? (
                  <div className="flex flex-col items-center gap-3 py-10 px-6">
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/30">
                      <FileText className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="space-y-0.5 text-center">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{file?.name}</p>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">PDF &middot; {file ? (file.size / 1024 / 1024).toFixed(2) : ""} MB &middot; Ready to scan</p>
                    </div>
                    <p className="text-[9px] text-primary-blue dark:text-primary-green font-semibold">Click to change file</p>
                  </div>
                ) : (
                  <div className="w-full relative">
                    <img src={previewUrl} alt="Bill Preview" className="w-full max-h-[320px] object-contain rounded-2xl" />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-wider backdrop-blur-sm">
                      Click to change
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 px-6 hover:bg-slate-50/50 dark:hover:bg-slate-950/10 w-full h-full transition-colors">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 rounded-full border border-slate-150 dark:border-slate-800/85 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6 group-hover:text-primary-blue dark:group-hover:text-primary-green transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-850 dark:text-white">Drop your electricity bill here</p>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      or <span className="text-primary-blue dark:text-primary-green">click to upload</span>
                    </p>
                  </div>
                  <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">Supports JPG, PNG, WEBP, PDF (Max 10MB)</p>
                </div>
              )}
            </label>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/10 dark:border-red-900/30 dark:text-red-400 rounded-xl text-[10px] font-bold flex items-center gap-1.5 justify-center">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* Selected File bar */}
            {file && (
              <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-150 dark:border-slate-855 flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-primary-blue dark:text-primary-green shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[300px]">{file.name}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {file && status === "idle" && (
              <button
                onClick={handleUploadAndScan}
                className="w-full h-11 bg-primary-blue text-white dark:bg-primary-green dark:text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
              >
                Scan &amp; Analyze Bill
              </button>
            )}

            {/* ── Cinematic Analysis Pipeline Animation ── */}
            <AnimatePresence>
            {status !== "idle" && status !== "success" && status !== "error" && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden text-left"
              >
                {/* Header bar */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Bill Analysis Pipeline</span>
                  <div className="ml-auto w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-cyan-500 animate-spin" />
                </div>

                <div className="p-4 space-y-3">
                  {([
                    { label: "Scanning Bill",       icon: "🔍", color: "from-cyan-400 to-blue-500",   glow: "rgba(34,211,238,0.5)",  stepIdx: 0 as const },
                    { label: "Extracting Units",    icon: "⚡", color: "from-amber-400 to-orange-500", glow: "rgba(251,191,36,0.5)",  stepIdx: 1 as const },
                    { label: "Generating Insights", icon: "✨", color: "from-violet-400 to-purple-600", glow: "rgba(167,139,250,0.5)", stepIdx: 2 as const },
                  ] as const).map(({ label, icon, color, glow, stepIdx }) => {
                    const pct = stepProgress[stepIdx];
                    const isDone = pct === 100;
                    const isActive = analysisStep === stepIdx && !isDone;
                    const isPending = analysisStep < stepIdx;
                    return (
                      <motion.div
                        key={stepIdx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: isPending ? 0.35 : 1, x: 0 }}
                        transition={{ delay: stepIdx * 0.08, duration: 0.3 }}
                        className="space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm leading-none ${isActive ? "animate-pulse" : ""}`}>{icon}</span>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${
                              isDone ? "text-primary-green" : isActive ? "text-slate-800 dark:text-white" : "text-slate-400"
                            }`}>{label}</span>
                            {isDone && (
                              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[8px] font-black text-primary-green">&#10003;</motion.span>
                            )}
                          </div>
                          <span className={`text-[9px] font-black tabular-nums ${
                            isDone ? "text-primary-green" : isActive ? "text-slate-600 dark:text-slate-300" : "text-slate-300 dark:text-slate-600"
                          }`}>{pct}%</span>
                        </div>
                        <div className="h-[6px] bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${color}`}
                            style={{ width: `${pct}%`, boxShadow: pct > 0 && !isDone ? `0 0 8px ${glow}` : undefined }}
                            transition={{ duration: 0.15, ease: "linear" }}
                          />
                        </div>
                        {isActive && pct > 0 && pct < 100 && (
                          <motion.div
                            className="h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent -mt-[7px] pointer-events-none"
                            style={{ width: `${pct}%` }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>

'@

$middleLines = $middle -split "`n"

$final = $part1 + $middleLines + $part2

[System.IO.File]::WriteAllLines($src, $final, [System.Text.UTF8Encoding]::new($false))
Write-Output "Done. File written with $($final.Length) lines."
