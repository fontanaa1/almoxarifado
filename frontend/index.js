<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Almoxarifado SENAI</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        senai: { DEFAULT: '#E30613', dark: '#B0000C', light: '#FFE8E9' },
                        ink: '#15181D'
                    }
                }
            }
        }
    </script>

    <!-- Fontes -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
    
    <!-- QR Code Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    
    <!-- Ícones -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #F5F5F7; }
        
        .tab-btn {
            padding: 0.6rem 1.2rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: rgba(255,255,255,0.6);
            border-bottom: 3px solid transparent;
            transition: all 0.2s ease;
            cursor: pointer;
            background: transparent;
            border: none;
        }
        .tab-btn:hover { color: #fff; }
        .tab-btn-active { color: #fff; border-bottom-color: #E30613; }
        
        .stat-card {
            background: #fff;
            border-radius: 0.75rem;
            padding: 1rem 1.2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            transition: all 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .stat-icon {
            width: 2.8rem;
            height: 2.8rem;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .field {
            width: 100%;
            padding: 0.65rem 0.85rem;
            border: 1.5px solid #E5E7EB;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            transition: all 0.2s ease;
            background: #fff;
        }
        .field:focus {
            outline: none;
            border-color: #E30613;
            box-shadow: 0 0 0 3px rgba(227,6,19,0.1);
        }
        
        .code-chip {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            font-size: 0.7rem;
            background: #F0F0F2;
            padding: 0.2rem 0.6rem;
            border-radius: 0.375rem;
            color: #4B5058;
            border: 1px solid #E5E5E8;
        }
        
        .qty-low { color: #E30613; font-weight: 700; }
        .qty-ok { color: #22C55E; font-weight: 600; }
        .qty-zero { color: #E30613; font-weight: 700; }
        
        .toast {
            background: #15181D;
            color: #fff;
            padding: 0.75rem 1.2rem;
            border-radius: 0.625rem;
            font-size: 0.875rem;
            font-weight: 500;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 0.6rem;
            animation: slideIn 0.3s ease;
            min-width: 280px;
            max-width: 400px;
        }
        .toast-success { border-left: 4px solid #22C55E; }
        .toast-error { border-left: 4px solid #E30613; }
        .toast-info { border-left: 4px solid #3B82F6; }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .toast-out { animation: slideOut 0.3s ease forwards; }
        @keyframes slideOut {
            to { opacity: 0; transform: translateY(20px); }
        }
        
        .modal-pop {
            animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalPop {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .item-card {
            padding: 1rem 1.1rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            border-bottom: 1px solid #F0F0F2;
        }
        .item-card-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.75rem;
        }
        
        #qr-reader {
            width: 100%;
            min-height: 300px;
            background: #f8f8fa;
            border-radius: 0.75rem;
            overflow: hidden;
        }
        #qr-reader video {
            width: 100% !important;
            height: auto !important;
        }
        
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D7D7DC; border-radius: 999px; }
        ::-webkit-scrollbar-track { background: transparent; }
        
        @media (max-width: 640px) {
            .tab-btn { padding: 0.5rem 0.8rem; font-size: 0.75rem; }
            .stat-card { padding: 0.8rem; }
            .stat-icon { width: 2.2rem; height: 2.2rem; }
            .stat-card .text-2xl { font-size: 1.25rem; }
        }
    </style>
</head>
<body>

    <!-- HEADER -->
    <header class="bg-ink text-white sticky top-0 z-50 shadow-lg">
        <div class="h-1 bg-senai"></div>
        <div class="container mx-auto px-4 py-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="bg-senai px-3 py-1.5 rounded font-extrabold text-lg tracking-wider">SENAI</div>
                    <div>
                        <h1 class="text-base font-semibold">Almoxarifado</h1>
                        <p class="text-[10px] text-white/40 hidden sm:block">Gestão de materiais</p>
                    </div>
                </div>
                <button onclick="carregarDados()" class="p-2 hover:bg-white/10 rounded-lg transition">
                    <i data-lucide="refresh-cw" class="w-4 h-4" id="refreshIcon"></i>
                </button>
            </div>
            <nav class="mt-3 flex gap-1 overflow-x-auto pb-0.5">
                <button onclick="switchTab('dashboard')" class="tab-btn tab-btn-active" id="tab-dashboard">
                    <i data-lucide="layout-dashboard" class="inline w-4 h-4 mr-1"></i>Dashboard
                </button>
                <button onclick="switchTab('estoque')" class="tab-btn" id="tab-estoque">
                    <i data-lucide="boxes" class="inline w-4 h-4 mr-1"></i>Estoque
                </button>
                <button onclick="switchTab('arquivo')" class="tab-btn" id="tab-arquivo">
                    <i data-lucide="archive" class="inline w-4 h-4 mr-1"></i>Arquivo
                </button>
                <button onclick="switchTab('movimentacoes')" class="tab-btn" id="tab-movimentacoes">
                    <i data-lucide="activity" class="inline w-4 h-4 mr-1"></i>Movimentações
                </button>
                <button onclick="switchTab('qrcode')" class="tab-btn" id="tab-qrcode">
                    <i data-lucide="scan" class="inline w-4 h-4 mr-1"></i>QR Code
                </button>
            </nav>
        </div>
    </header>

    <!-- MAIN -->
    <main class="container mx-auto px-4 py-6 flex-grow">

        <!-- ========== DASHBOARD ========== -->
        <section id="section-dashboard">
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <div class="stat-card">
                    <div class="stat-icon bg-senai-light text-senai"><i data-lucide="boxes" class="w-5 h-5"></i></div>
                    <div><p class="text-2xl font-extrabold" id="stat-total">0</p><p class="text-xs text-gray-500">Ativos</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-amber-50 text-amber-600"><i data-lucide="alert-triangle" class="w-5 h-5"></i></div>
                    <div><p class="text-2xl font-extrabold" id="stat-low">0</p><p class="text-xs text-gray-500">Estoque baixo</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-blue-50 text-blue-600"><i data-lucide="layers" class="w-5 h-5"></i></div>
                    <div><p class="text-2xl font-extrabold" id="stat-categories">0</p><p class="text-xs text-gray-500">Categorias</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-gray-100 text-gray-600"><i data-lucide="archive" class="w-5 h-5"></i></div>
                    <div><p class="text-2xl font-extrabold" id="stat-archived">0</p><p class="text-xs text-gray-500">Arquivados</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-green-50 text-green-600"><i data-lucide="activity" class="w-5 h-5"></i></div>
                    <div><p class="text-2xl font-extrabold" id="stat-mov-hoje">0</p><p class="text-xs text-gray-500">Mov. hoje</p></div>
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <button onclick="openModal()" class="bg-senai text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-senai-dark transition shadow">
                    <i data-lucide="plus-circle" class="w-6 h-6"></i>
                    <span class="text-sm font-semibold">Novo Item</span>
                </button>
                <button onclick="switchTab('qrcode')" class="bg-indigo-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-indigo-700 transition shadow">
                    <i data-lucide="scan" class="w-6 h-6"></i>
                    <span class="text-sm font-semibold">Escanear QR</span>
                </button>
                <button onclick="switchTab('movimentacoes')" class="bg-emerald-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-emerald-700 transition shadow">
                    <i data-lucide="clock" class="w-6 h-6"></i>
                    <span class="text-sm font-semibold">Histórico</span>
                </button>
                <button onclick="exportarDados()" class="bg-gray-700 text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-800 transition shadow">
                    <i data-lucide="download" class="w-6 h-6"></i>
                    <span class="text-sm font-semibold">Exportar</span>
                </button>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 class="font-bold text-gray-700">Últimas Movimentações</h3>
                    <button onclick="switchTab('movimentacoes')" class="text-sm text-senai font-semibold hover:underline">Ver todas</button>
                </div>
                <div id="ultimas-movimentacoes" class="divide-y divide-gray-100">
                    <div class="p-8 text-center text-gray-400"><i data-lucide="clock" class="w-6 h-6 mx-auto mb-2"></i><p class="text-sm">Carregando...</p></div>
                </div>
            </div>
        </section>

        <!-- ========== ESTOQUE ========== -->
        <section id="section-estoque" class="hidden">
            <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-5 gap-3">
                <div class="relative w-full sm:max-w-sm">
                    <input type="text" id="searchInput" oninput="renderTabelas()" placeholder="Buscar por nome, SKU ou categoria…"
                           class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-senai/40 focus:border-senai text-sm shadow-sm">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"></i>
                </div>
                <button onclick="openModal()" class="bg-senai hover:bg-senai-dark text-white px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-sm">
                    <i data-lucide="plus" class="w-4 h-4"></i> Novo Material
                </button>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="font-bold text-gray-700 flex items-center"><i data-lucide="boxes" class="mr-2 text-senai w-4 h-4"></i>Materiais em Estoque</h2>
                    <span id="count-ativos" class="text-xs bg-senai-light text-senai font-semibold px-2.5 py-1 rounded-full">0 itens</span>
                </div>
                <div id="loading-ativos" class="p-10 text-center text-gray-400"><i data-lucide="loader-circle" class="w-6 h-6 animate-spin mx-auto mb-2"></i><p class="text-sm">Carregando...</p></div>
                <div class="overflow-x-auto hidden sm:block">
                    <table class="w-full text-left border-collapse">
                        <thead><tr class="bg-gray-50 text-gray-500 uppercase text-[11px] tracking-wide">
                            <th class="p-4 font-semibold">SKU</th><th class="p-4 font-semibold">Material</th>
                            <th class="p-4 font-semibold">Categoria</th><th class="p-4 font-semibold">Qtd.</th>
                            <th class="p-4 font-semibold">Est. Mín.</th><th class="p-4 font-semibold">Localização</th>
                            <th class="p-4 font-semibold text-center">Ações</th>
                        </tr></thead>
                        <tbody id="table-ativos" class="divide-y divide-gray-100 text-sm"></tbody>
                    </table>
                </div>
                <div id="cards-ativos" class="sm:hidden divide-y divide-gray-100"></div>
            </div>
        </section>

        <!-- ========== ARQUIVO MORTO ========== -->
        <section id="section-arquivo" class="hidden">
            <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-5 gap-3">
                <div class="relative w-full sm:max-w-sm">
                    <input type="text" id="searchArchived" oninput="renderTabelas()" placeholder="Buscar no arquivo morto…"
                           class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-senai/40 focus:border-senai text-sm shadow-sm">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"></i>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="font-bold text-gray-700 flex items-center"><i data-lucide="archive" class="mr-2 text-gray-500 w-4 h-4"></i>Arquivo Morto</h2>
                    <span id="count-mortos" class="text-xs bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">0 itens</span>
                </div>
                <div id="loading-mortos" class="p-10 text-center text-gray-400"><i data-lucide="loader-circle" class="w-6 h-6 animate-spin mx-auto mb-2"></i><p class="text-sm">Carregando...</p></div>
                <div class="overflow-x-auto hidden sm:block">
                    <table class="w-full text-left border-collapse">
                        <thead><tr class="bg-gray-50 text-gray-500 uppercase text-[11px] tracking-wide">
                            <th class="p-4 font-semibold">SKU</th><th class="p-4 font-semibold">Material</th>
                            <th class="p-4 font-semibold">Motivo</th><th class="p-4 font-semibold">Data</th>
                            <th class="p-4 font-semibold text-center">Ações</th>
                        </tr></thead>
                        <tbody id="table-mortos" class="divide-y divide-gray-100 text-sm"></tbody>
                    </table>
                </div>
                <div id="cards-mortos" class="sm:hidden divide-y divide-gray-100"></div>
            </div>
        </section>

        <!-- ========== MOVIMENTAÇÕES ========== -->
        <section id="section-movimentacoes" class="hidden">
            <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-5 gap-3">
                <div class="relative w-full sm:max-w-sm">
                    <input type="text" id="searchMov" oninput="renderMovimentacoes()" placeholder="Buscar por material ou responsável…"
                           class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-senai/40 focus:border-senai text-sm shadow-sm">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"></i>
                </div>
                <select id="filterMovTipo" onchange="renderMovimentacoes()" class="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm">
                    <option value="todos">Todos os tipos</option>
                    <option value="entrada">Entradas</option>
                    <option value="saida">Saídas</option>
                    <option value="arquivamento">Arquivamentos</option>
                    <option value="restauracao">Restaurações</option>
                </select>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b border-gray-100"><h2 class="font-bold text-gray-700 flex items-center"><i data-lucide="activity" class="mr-2 text-senai w-4 h-4"></i>Histórico de Movimentações</h2></div>
                <div id="loading-mov" class="p-10 text-center text-gray-400"><i data-lucide="loader-circle" class="w-6 h-6 animate-spin mx-auto mb-2"></i><p class="text-sm">Carregando...</p></div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead><tr class="bg-gray-50 text-gray-500 uppercase text-[11px] tracking-wide">
                            <th class="p-4 font-semibold">Data/Hora</th><th class="p-4 font-semibold">Material</th>
                            <th class="p-4 font-semibold">Tipo</th><th class="p-4 font-semibold">Qtd.</th>
                            <th class="p-4 font-semibold">Responsável</th><th class="p-4 font-semibold">Motivo</th>
                        </tr></thead>
                        <tbody id="table-mov" class="divide-y divide-gray-100 text-sm"></tbody>
                    </table>
                </div>
                <div id="cards-mov" class="sm:hidden divide-y divide-gray-100"></div>
            </div>
        </section>

        <!-- ========== QR CODE ========== -->
        <section id="section-qrcode" class="hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 class="font-bold text-gray-700 mb-4 flex items-center"><i data-lucide="scan" class="mr-2 text-senai w-5 h-5"></i>Escanear QR Code</h3>
                    <div id="qr-reader" class="w-full" style="min-height:300px;"></div>
                    <div id="qr-result" class="mt-4 hidden">
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p class="text-sm font-semibold text-green-700">✅ Código identificado!</p>
                            <p class="text-sm font-mono mt-1" id="qr-sku"></p>
                        </div>
                    </div>
                    <div id="qr-actions" class="mt-4 hidden">
                        <div class="flex flex-col gap-3">
                            <div class="flex gap-2">
                                <input type="number" id="qr-quantidade" placeholder="Qtd" class="field w-28" min="1" value="1">
                                <input type="text" id="qr-responsavel" placeholder="Responsável" class="field flex-1">
                            </div>
                            <input type="text" id="qr-motivo" placeholder="Motivo (opcional)" class="field">
                            <div class="flex gap-2">
                                <button onclick="processarEntradaQR()" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold transition">
                                    <i data-lucide="arrow-down" class="inline w-4 h-4 mr-1"></i> Entrada
                                </button>
                                <button onclick="processarSaidaQR()" class="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-semibold transition">
                                    <i data-lucide="arrow-up" class="inline w-4 h-4 mr-1"></i> Saída
                                </button>
                            </div>
                            <button onclick="limparQR()" class="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
                        </div>
                    </div>
                    <div id="qr-info" class="mt-4 hidden">
                        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p class="text-sm"><strong>Material:</strong> <span id="qr-nome"></span></p>
                            <p class="text-sm"><strong>Localização:</strong> <span id="qr-localizacao"></span></p>
                            <p class="text-sm"><strong>Estoque atual:</strong> <span id="qr-estoque"></span></p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 class="font-bold text-gray-700 mb-4 flex items-center"><i data-lucide="qr-code" class="mr-2 text-senai w-5 h-5"></i>Gerar QR Code</h3>
                    <div class="space-y-4">
                        <input type="text" id="qr-generator-sku" placeholder="SKU do material" class="field">
                        <button onclick="gerarQRCode()" class="w-full bg-senai hover:bg-senai-dark text-white py-2.5 rounded-lg font-semibold transition">
                            <i data-lucide="qr-code" class="inline w-4 h-4 mr-1"></i> Gerar QR Code
                        </button>
                        <div id="qr-generator-result" class="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hidden">
                            <div id="qr-code-container"></div>
                            <p class="text-sm font-mono mt-2 text-gray-600" id="qr-generator-sku-display"></p>
                            <button onclick="baixarQRCode()" class="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition">
                                <i data-lucide="download" class="inline w-4 h-4 mr-1"></i> Baixar QR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </main>

    <!-- FOOTER -->
    <footer class="bg-ink text-gray-400 py-4 text-center text-xs mt-6">
        <p>Almoxarifado SENAI &copy; 2026</p>
    </footer>

    <!-- ========== MODAIS ========== -->

    <!-- Modal Novo Material -->
    <div id="modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-pop">
            <div class="bg-ink text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h3 id="modal-title" class="font-bold text-base">Novo Material</h3>
                <button onclick="closeModal()" class="hover:text-white/70 transition"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form id="materialForm" onsubmit="saveMaterial(event)" class="p-6 space-y-4">
                <input type="hidden" id="item-id">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Família</label>
                        <select id="item-familia" onchange="atualizarTipos()" required class="field">
                            <option value="">Selecione...</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipo</label>
                        <select id="item-tipo" onchange="gerarSKU()" required class="field">
                            <option value="">Selecione...</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">SKU (gerado)</label>
                        <input type="text" id="item-sku" readonly class="field bg-gray-50 font-mono">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Quantidade Inicial</label>
                        <input type="number" id="item-qty" min="0" required class="field" value="0">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nome do Material</label>
                    <input type="text" id="item-name" required placeholder="Ex: Caixa de Arquivo A4" class="field">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descrição</label>
                    <textarea id="item-descricao" rows="2" placeholder="Descrição detalhada" class="field resize-none"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Categoria</label>
                        <select id="item-categoria" class="field">
                            <option value="Ferramentas">Ferramentas</option>
                            <option value="Elétrica">Elétrica</option>
                            <option value="Mecânica">Mecânica</option>
                            <option value="Informatica">Informática</option>
                            <option value="EPI">EPIs</option>
                            <option value="Documentos">Documentos</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estoque Mínimo</label>
                        <input type="number" id="item-min" min="0" class="field" value="5">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Localização</label>
                    <input type="text" id="item-localizacao" placeholder="Ex: Estante B - Prateleira 3" class="field">
                </div>
                <div class="flex justify-end gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition">Cancelar</button>
                    <button type="submit" id="save-btn" class="px-5 py-2.5 bg-senai hover:bg-senai-dark text-white rounded-lg font-semibold text-sm transition flex items-center gap-2">
                        <span id="save-btn-text">Cadastrar</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Arquivamento -->
    <div id="archive-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden modal-pop">
            <div class="px-6 pt-6 pb-2 flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><i data-lucide="archive" class="w-5 h-5"></i></div>
                <div><h3 class="font-bold text-base text-gray-800">Mover para arquivo morto</h3><p class="text-sm text-gray-500">Informe o motivo</p></div>
            </div>
            <form onsubmit="confirmArchive(event)" class="px-6 pb-6 pt-3 space-y-4">
                <input type="hidden" id="archive-item-id">
                <input type="text" id="archive-reason" required placeholder="Ex: Quebrado, obsoleto..." class="field">
                <div class="flex justify-end gap-3 pt-1">
                    <button type="button" onclick="closeArchiveModal()" class="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition">Cancelar</button>
                    <button type="submit" class="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition">Arquivar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Confirmação -->
    <div id="confirm-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden modal-pop">
            <div class="px-6 pt-6 pb-2 flex items-start gap-3">
                <div id="confirm-icon-wrap" class="w-10 h-10 rounded-full bg-red-50 text-senai flex items-center justify-center"><i data-lucide="trash-2" class="w-5 h-5"></i></div>
                <div><h3 id="confirm-title" class="font-bold text-base text-gray-800">Confirmar ação</h3><p id="confirm-message" class="text-sm text-gray-500">Tem certeza?</p></div>
            </div>
            <div class="px-6 pb-6 pt-3 flex justify-end gap-3">
                <button onclick="closeConfirmModal()" class="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition">Cancelar</button>
                <button id="confirm-btn" class="px-5 py-2.5 bg-senai hover:bg-senai-dark text-white rounded-lg font-semibold text-sm transition">Confirmar</button>
            </div>
        </div>
    </div>

    <!-- Modal Visualizar QR -->
    <div id="qr-view-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden modal-pop">
            <div class="px-6 pt-6 pb-4 text-center">
                <h3 class="font-bold text-gray-800 mb-2">QR Code</h3>
                <div id="qr-view-container" class="flex justify-center p-4"></div>
                <p class="text-sm font-mono text-gray-600" id="qr-view-sku"></p>
                <div class="flex justify-center gap-3 mt-4">
                    <button onclick="closeQRViewModal()" class="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition">Fechar</button>
                    <button onclick="baixarQRCodeView()" class="px-4 py-2 bg-senai hover:bg-senai-dark text-white rounded-lg font-semibold text-sm transition">
                        <i data-lucide="download" class="inline w-4 h-4 mr-1"></i> Baixar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Container -->
    <div id="toast-container" class="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 items-stretch sm:items-end"></div>

    <!-- ========== SCRIPT ========== -->
    <script>
        // ============================================================
        // CONFIGURAÇÃO - URL DA SUA API
        // ============================================================
        // ALTERE ESTA URL PARA O ENDEREÇO DO SEU BACKEND
        const API_URL = 'https://backend-almoxarifado3.vercel.app/api'; 

        
        // ============================================================
        // ESTADO GLOBAL
        // ============================================================
        let inventory = [];
        let movimentacoes = [];
        let currentTab = 'dashboard';
        let currentQRCode = null;
        let qrScanner = null;
        let pendingConfirmAction = null;

        // ============================================================
        // UTILITÁRIOS
        // ============================================================
        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const icons = { success: 'check-circle', error: 'x-circle', info: 'info' };
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `<i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 shrink-0"></i><span>${message}</span>`;
            container.appendChild(toast);
            if (window.lucide) lucide.createIcons();
            setTimeout(() => { toast.classList.add('toast-out'); setTimeout(() => toast.remove(), 300); }, 3500);
        }

        function formatDate(dateStr) {
            if (!dateStr) return '—';
            const d = new Date(dateStr);
            return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }

        function formatDateShort(dateStr) {
            if (!dateStr) return '—';
            return new Date(dateStr).toLocaleDateString('pt-BR');
        }

        function getTipoIcon(tipo) {
            const map = { 'entrada': 'arrow-down', 'saida': 'arrow-up', 'arquivamento': 'archive', 'restauracao': 'rotate-ccw' };
            return map[tipo] || 'circle';
        }

        function getTipoColor(tipo) {
            const map = { 
                'entrada': 'text-emerald-600 bg-emerald-50', 
                'saida': 'text-amber-600 bg-amber-50',
                'arquivamento': 'text-gray-600 bg-gray-50', 
                'restauracao': 'text-blue-600 bg-blue-50' 
            };
            return map[tipo] || 'text-gray-600 bg-gray-50';
        }

        // ============================================================
        // NAVEGAÇÃO
        // ============================================================
        function switchTab(tab) {
            currentTab = tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn-active'));
            document.querySelectorAll('section[id^="section-"]').forEach(s => s.classList.add('hidden'));

            const map = {
                'dashboard': 'tab-dashboard',
                'estoque': 'tab-estoque',
                'arquivo': 'tab-arquivo',
                'movimentacoes': 'tab-movimentacoes',
                'qrcode': 'tab-qrcode'
            };
            document.getElementById(map[tab])?.classList.add('tab-btn-active');
            document.getElementById('section-' + tab)?.classList.remove('hidden');

            if (tab === 'qrcode') setTimeout(iniciarScannerQR, 500);
            else pararScannerQR();
            if (tab === 'movimentacoes') renderMovimentacoes();
        }

        // ============================================================
        // CARREGAR DADOS DA API
        // ============================================================
        async function carregarDados() {
            const icon = document.getElementById('refreshIcon');
            if (icon) icon.classList.add('animate-spin');
            
            try {
                await Promise.all([loadInventory(), loadMovimentacoes(), loadStats()]);
            } catch (error) {
                console.error('Erro:', error);
                showToast('Erro ao carregar dados do servidor', 'error');
            } finally {
                if (icon) icon.classList.remove('animate-spin');
            }
        }

        async function loadInventory() {
            try {
                const res = await fetch(`${API_URL}/materiais?status=todos&limit=999`);
                if (!res.ok) throw new Error('Erro ao carregar materiais');
                const data = await res.json();
                inventory = data.data || [];
                renderTabelas();
                return inventory;
            } catch (error) {
                console.error('Erro loadInventory:', error);
                throw error;
            }
        }

        async function loadMovimentacoes() {
            try {
                const res = await fetch(`${API_URL}/movimentacoes?limit=200`);
                if (!res.ok) throw new Error('Erro ao carregar movimentações');
                const data = await res.json();
                movimentacoes = data.data || [];
                renderMovimentacoes();
                renderUltimasMovimentacoes();
                return movimentacoes;
            } catch (error) {
                console.error('Erro loadMovimentacoes:', error);
                throw error;
            }
        }

        async function loadStats() {
            try {
                const res = await fetch(`${API_URL}/estatisticas`);
                if (!res.ok) throw new Error('Erro ao carregar estatísticas');
                const stats = await res.json();
                document.getElementById('stat-total').textContent = stats.total || 0;
                document.getElementById('stat-low').textContent = stats.low_stock || 0;
                document.getElementById('stat-categories').textContent = stats.categories || 0;
                document.getElementById('stat-archived').textContent = stats.archived || 0;
                document.getElementById('stat-mov-hoje').textContent = stats.movimentacoes_hoje || 0;
                return stats;
            } catch (error) {
                console.error('Erro loadStats:', error);
                throw error;
            }
        }

        // ============================================================
        // FAMÍLIAS E TIPOS
        // ============================================================
        async function carregarFamilias() {
            try {
                const res = await fetch(`${API_URL}/familias`);
                if (!res.ok) throw new Error('Erro ao carregar famílias');
                const familias = await res.json();
                const select = document.getElementById('item-familia');
                select.innerHTML = '<option value="">Selecione...</option>';
                familias.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f.codigo;
                    opt.textContent = `${f.codigo} - ${f.nome}`;
                    select.appendChild(opt);
                });
                return familias;
            } catch (error) {
                console.error(error);
                showToast('Erro ao carregar famílias', 'error');
                return [];
            }
        }

        async function atualizarTipos() {
            const familia = document.getElementById('item-familia').value;
            const tipoSelect = document.getElementById('item-tipo');
            if (!familia) { tipoSelect.innerHTML = '<option value="">Selecione...</option>'; return; }

            try {
                const res = await fetch(`${API_URL}/tipos?familia_codigo=${familia}`);
                if (!res.ok) throw new Error('Erro ao carregar tipos');
                const tipos = await res.json();
                tipoSelect.innerHTML = '<option value="">Selecione...</option>';
                tipos.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t.codigo;
                    opt.textContent = `${t.codigo} - ${t.nome}`;
                    tipoSelect.appendChild(opt);
                });
            } catch (error) {
                console.error(error);
                showToast('Erro ao carregar tipos', 'error');
            }
        }

        async function gerarSKU() {
            const familia = document.getElementById('item-familia').value;
            const tipo = document.getElementById('item-tipo').value;
            const skuInput = document.getElementById('item-sku');
            if (!familia || !tipo) { skuInput.value = ''; return; }

            try {
                const res = await fetch(`${API_URL}/materiais/proximo-sku?familia_codigo=${familia}&tipo_codigo=${tipo}`);
                if (!res.ok) throw new Error('Erro ao gerar SKU');
                const data = await res.json();
                skuInput.value = data.sku;
            } catch (error) {
                console.error(error);
                showToast('Erro ao gerar SKU', 'error');
            }
        }

        // ============================================================
        // RENDER TABELAS
        // ============================================================
        function renderTabelas() {
            const search = document.getElementById('searchInput')?.value?.toLowerCase() || '';
            const searchArchived = document.getElementById('searchArchived')?.value?.toLowerCase() || '';

            const ativos = inventory.filter(i => i.status === 'ativo' && 
                (i.nome?.toLowerCase().includes(search) || i.sku?.toLowerCase().includes(search) || i.categoria?.toLowerCase().includes(search)));

            const mortos = inventory.filter(i => i.status === 'morto' && 
                (i.nome?.toLowerCase().includes(searchArchived) || i.sku?.toLowerCase().includes(searchArchived)));

            document.getElementById('loading-ativos')?.classList.add('hidden');
            document.getElementById('loading-mortos')?.classList.add('hidden');
            document.getElementById('count-ativos').textContent = `${ativos.length} ${ativos.length === 1 ? 'item' : 'itens'}`;
            document.getElementById('count-mortos').textContent = `${mortos.length} ${mortos.length === 1 ? 'item' : 'itens'}`;

            // Tabela Ativos
            const tableAtivos = document.getElementById('table-ativos');
            if (ativos.length === 0) {
                tableAtivos.innerHTML = `<tr><td colspan="7" class="p-10 text-center text-gray-400">
                    <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                    <p class="text-sm">${search ? 'Nenhum material encontrado.' : 'Nenhum material cadastrado.'}</p>
                </td></tr>`;
            } else {
                tableAtivos.innerHTML = ativos.map(item => {
                    const qtyClass = item.quantidade <= 0 ? 'qty-zero' : 
                                    item.quantidade <= (item.estoque_minimo || 5) ? 'qty-low' : 'qty-ok';
                    return `<tr class="hover:bg-gray-50 transition">
                        <td class="p-4"><span class="code-chip">${item.sku}</span></td>
                        <td class="p-4 font-medium text-gray-800">${item.nome}</td>
                        <td class="p-4"><span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">${item.categoria || '—'}</span></td>
                        <td class="p-4 ${qtyClass}">${item.quantidade}</td>
                        <td class="p-4 text-gray-500">${item.estoque_minimo || 0}</td>
                        <td class="p-4 text-gray-500">${item.localizacao || '—'}</td>
                        <td class="p-4">
                            <div class="flex items-center justify-center gap-1">
                                <button onclick="verQRCode('${item.sku}')" title="Ver QR" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition">
                                    <i data-lucide="qr-code" class="w-4 h-4"></i>
                                </button>
                                <button onclick="openArchiveModal('${item.id}')" title="Arquivar" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition">
                                    <i data-lucide="archive" class="w-4 h-4"></i>
                                </button>
                                <button onclick="openDeleteModal('${item.id}')" title="Excluir" class="p-1.5 text-senai hover:bg-red-50 rounded-md transition">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </td>
                    </tr>`;
                }).join('');
            }

            // Cards Mobile Ativos
            const cardsAtivos = document.getElementById('cards-ativos');
            if (ativos.length === 0) {
                cardsAtivos.innerHTML = `<div class="p-8 text-center text-gray-400"><i data-lucide="inbox" class="w-7 h-7 mx-auto mb-2 opacity-50"></i><p class="text-sm">Nenhum material cadastrado.</p></div>`;
            } else {
                cardsAtivos.innerHTML = ativos.map(item => {
                    const qtyClass = item.quantidade <= 0 ? 'qty-zero' : 
                                    item.quantidade <= (item.estoque_minimo || 5) ? 'qty-low' : 'qty-ok';
                    return `<div class="item-card">
                        <div class="item-card-row"><span class="code-chip">${item.sku}</span><span class="${qtyClass}">Qtd: ${item.quantidade}</span></div>
                        <p class="font-semibold text-gray-800 text-sm">${item.nome}</p>
                        <div class="item-card-row"><span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">${item.categoria || '—'}</span><span class="text-xs text-gray-500">${item.localizacao || '—'}</span></div>
                        <div class="flex items-center gap-2 pt-1">
                            <button onclick="verQRCode('${item.sku}')" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 py-2 rounded-md"><i data-lucide="qrcode" class="w-3.5 h-3.5"></i> QR</button>
                            <button onclick="openArchiveModal('${item.id}')" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 py-2 rounded-md"><i data-lucide="archive" class="w-3.5 h-3.5"></i> Arquivar</button>
                            <button onclick="openDeleteModal('${item.id}')" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-senai bg-red-50 py-2 rounded-md"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                        </div>
                    </div>`;
                }).join('');
            }

            // Tabela Arquivo Morto
            const tableMortos = document.getElementById('table-mortos');
            if (mortos.length === 0) {
                tableMortos.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-gray-400">
                    <i data-lucide="archive-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                    <p class="text-sm">Nenhum item no arquivo morto.</p>
                </td></tr>`;
            } else {
                tableMortos.innerHTML = mortos.map(item => `
                    <tr class="hover:bg-gray-50 transition bg-gray-50/40">
                        <td class="p-4"><span class="code-chip opacity-70">${item.sku}</span></td>
                        <td class="p-4 font-medium line-through text-gray-400">${item.nome}</td>
                        <td class="p-4 text-gray-600">${item.motivo_arquivamento || 'Desativado'}</td>
                        <td class="p-4 text-gray-500 text-xs font-mono">${formatDateShort(item.data_arquivamento)}</td>
                        <td class="p-4">
                            <div class="flex items-center justify-center gap-1">
                                <button onclick="openRestoreModal('${item.id}')" title="Restaurar" class="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition">
                                    <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                                </button>
                                <button onclick="openDeleteModal('${item.id}')" title="Excluir" class="p-1.5 text-senai hover:bg-red-50 rounded-md transition">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }

            // Cards Mobile Arquivo Morto
            const cardsMortos = document.getElementById('cards-mortos');
            if (mortos.length === 0) {
                cardsMortos.innerHTML = `<div class="p-8 text-center text-gray-400"><i data-lucide="archive-x" class="w-7 h-7 mx-auto mb-2 opacity-50"></i><p class="text-sm">Nenhum item no arquivo morto.</p></div>`;
            } else {
                cardsMortos.innerHTML = mortos.map(item => `
                    <div class="item-card bg-gray-50/40">
                        <div class="item-card-row"><span class="code-chip opacity-70">${item.sku}</span><span class="text-xs text-gray-400 font-mono">${formatDateShort(item.data_arquivamento)}</span></div>
                        <p class="font-semibold text-gray-400 line-through text-sm">${item.nome}</p>
                        <p class="text-xs text-gray-500">${item.motivo_arquivamento || 'Desativado'}</p>
                        <div class="flex items-center gap-2 pt-1">
                            <button onclick="openRestoreModal('${item.id}')" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 py-2 rounded-md"><i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Restaurar</button>
                            <button onclick="openDeleteModal('${item.id}')" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-senai bg-red-50 py-2 rounded-md"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Excluir</button>
                        </div>
                    </div>
                `).join('');
            }

            if (window.lucide) lucide.createIcons();
        }

        // ============================================================
        // MOVIMENTAÇÕES
        // ============================================================
        function renderMovimentacoes() {
            const search = document.getElementById('searchMov')?.value?.toLowerCase() || '';
            const tipo = document.getElementById('filterMovTipo')?.value || 'todos';

            let filtered = movimentacoes;
            if (tipo !== 'todos') filtered = filtered.filter(m => m.tipo === tipo);
            if (search) filtered = filtered.filter(m => 
                (m.responsavel?.toLowerCase().includes(search)) || (m.observacao?.toLowerCase().includes(search))
            );

            document.getElementById('loading-mov')?.classList.add('hidden');

            const tableMov = document.getElementById('table-mov');
            if (filtered.length === 0) {
                tableMov.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-gray-400">
                    <i data-lucide="clock" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                    <p class="text-sm">Nenhuma movimentação registrada.</p>
                </td></tr>`;
            } else {
                tableMov.innerHTML = filtered.slice(0, 100).map(m => {
                    const material = inventory.find(i => i.id === m.material_id);
                    return `<tr class="hover:bg-gray-50 transition">
                        <td class="p-4 text-xs font-mono text-gray-500">${formatDate(m.created_at)}</td>
                        <td class="p-4 font-medium text-gray-800">${material?.nome || '—'}</td>
                        <td class="p-4"><span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTipoColor(m.tipo)}">
                            <i data-lucide="${getTipoIcon(m.tipo)}" class="w-3 h-3"></i> ${m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1)}
                        </span></td>
                        <td class="p-4 font-mono font-semibold">${m.quantidade}</td>
                        <td class="p-4 text-gray-600">${m.responsavel || '—'}</td>
                        <td class="p-4 text-gray-500 text-sm">${m.motivo || m.observacao || '—'}</td>
                    </tr>`;
                }).join('');
            }

            if (window.lucide) lucide.createIcons();
        }

        function renderUltimasMovimentacoes() {
            const container = document.getElementById('ultimas-movimentacoes');
            const recentes = movimentacoes.slice(0, 10);
            if (recentes.length === 0) {
                container.innerHTML = `<div class="p-8 text-center text-gray-400"><i data-lucide="clock" class="w-6 h-6 mx-auto mb-2"></i><p class="text-sm">Nenhuma movimentação recente.</p></div>`;
                return;
            }
            container.innerHTML = recentes.map(m => {
                const material = inventory.find(i => i.id === m.material_id);
                return `<div class="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-8 h-8 rounded-full ${getTipoColor(m.tipo)} flex items-center justify-center">
                            <i data-lucide="${getTipoIcon(m.tipo)}" class="w-4 h-4"></i>
                        </div>
                        <div class="min-w-0">
                            <p class="font-medium text-sm truncate">${material?.nome || '—'}</p>
                            <p class="text-xs text-gray-500 truncate">${m.responsavel || '—'} • ${m.quantidade} un.</p>
                        </div>
                    </div>
                    <span class="text-xs text-gray-400 shrink-0">${formatDateShort(m.created_at)}</span>
                </div>`;
            }).join('');
            if (window.lucide) lucide.createIcons();
        }

        // ============================================================
        // QR CODE
        // ============================================================
        function iniciarScannerQR() {
            const reader = document.getElementById('qr-reader');
            if (!reader) return;
            reader.innerHTML = '';

            if (typeof Html5Qrcode === 'undefined') {
                reader.innerHTML = `<div class="p-8 text-center text-gray-400"><i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i><p class="text-sm">Biblioteca QR não carregada.</p></div>`;
                return;
            }

            try {
                qrScanner = new Html5Qrcode('qr-reader');
                qrScanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    onQRCodeScanned,
                    () => {}
                ).catch(err => {
                    console.error('Erro scanner:', err);
                    reader.innerHTML = `<div class="p-8 text-center text-amber-600"><i data-lucide="camera-off" class="w-8 h-8 mx-auto mb-2"></i><p class="text-sm font-medium">Não foi possível acessar a câmera.</p></div>`;
                    if (window.lucide) lucide.createIcons();
                });
            } catch (err) {
                console.error('Erro ao iniciar scanner:', err);
            }
        }

        function pararScannerQR() {
            if (qrScanner) { try { qrScanner.stop(); qrScanner.clear(); } catch(e) {} qrScanner = null; }
        }

        async function onQRCodeScanned(decodedText) {
            const sku = decodedText.trim();
            document.getElementById('qr-sku').textContent = sku;
            document.getElementById('qr-result').classList.remove('hidden');
            document.getElementById('qr-actions').classList.add('hidden');
            document.getElementById('qr-info').classList.add('hidden');

            try {
                // Busca o material pelo SKU - usando a rota correta
                const res = await fetch(`${API_URL}/materiais/${sku}`);
                if (!res.ok) throw new Error('Material não encontrado');
                const material = await res.json();
                
                document.getElementById('qr-nome').textContent = material.nome;
                document.getElementById('qr-localizacao').textContent = material.localizacao || 'Não definida';
                document.getElementById('qr-estoque').textContent = material.quantidade;
                document.getElementById('qr-info').classList.remove('hidden');
                document.getElementById('qr-actions').classList.remove('hidden');
                pararScannerQR();
                showToast(`Material identificado: ${material.nome}`, 'success');
            } catch (error) {
                showToast('Material não encontrado no sistema', 'error');
                document.getElementById('qr-result').classList.add('hidden');
                document.getElementById('qr-actions').classList.add('hidden');
                document.getElementById('qr-info').classList.add('hidden');
            }
        }

        function limparQR() {
            document.getElementById('qr-result').classList.add('hidden');
            document.getElementById('qr-actions').classList.add('hidden');
            document.getElementById('qr-info').classList.add('hidden');
            document.getElementById('qr-quantidade').value = '1';
            document.getElementById('qr-responsavel').value = '';
            document.getElementById('qr-motivo').value = '';
            iniciarScannerQR();
        }

        async function processarEntradaQR() {
            const sku = document.getElementById('qr-sku').textContent;
            const quantidade = parseInt(document.getElementById('qr-quantidade').value) || 1;
            const responsavel = document.getElementById('qr-responsavel').value.trim() || 'Operador';
            const localizacao = document.getElementById('qr-localizacao').textContent || '';

            if (!sku || quantidade <= 0) return showToast('Quantidade inválida', 'error');

            try {
                const res = await fetch(`${API_URL}/movimentacoes/entrada`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sku, quantidade, responsavel, localizacao })
                });
                if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro'); }
                showToast(`Entrada registrada: ${quantidade} unidades`, 'success');
                limparQR();
                await carregarDados();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }

        async function processarSaidaQR() {
            const sku = document.getElementById('qr-sku').textContent;
            const quantidade = parseInt(document.getElementById('qr-quantidade').value) || 1;
            const responsavel = document.getElementById('qr-responsavel').value.trim() || 'Operador';
            const motivo = document.getElementById('qr-motivo').value.trim() || 'Retirada';

            if (!sku || quantidade <= 0) return showToast('Quantidade inválida', 'error');

            try {
                const res = await fetch(`${API_URL}/movimentacoes/saida`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sku, quantidade, responsavel, motivo })
                });
                if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro'); }
                showToast(`Saída registrada: ${quantidade} unidades`, 'success');
                limparQR();
                await carregarDados();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }

        function gerarQRCode() {
            const sku = document.getElementById('qr-generator-sku').value.trim();
            if (!sku) return showToast('Digite um SKU válido', 'error');

            const container = document.getElementById('qr-code-container');
            container.innerHTML = '';
            const resultDiv = document.getElementById('qr-generator-result');
            resultDiv.classList.remove('hidden');

            try {
                new QRCode(container, { text: sku, width: 200, height: 200, colorDark: '#15181D', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
                document.getElementById('qr-generator-sku-display').textContent = sku;
                currentQRCode = sku;
                showToast('QR Code gerado com sucesso!', 'success');
            } catch (error) {
                showToast('Erro ao gerar QR Code', 'error');
            }
        }

        function baixarQRCode() {
            const canvas = document.querySelector('#qr-code-container canvas');
            if (!canvas) return showToast('Gere um QR Code primeiro', 'error');
            const link = document.createElement('a');
            link.download = `qr_${currentQRCode || 'material'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        function verQRCode(sku) {
            const container = document.getElementById('qr-view-container');
            container.innerHTML = '';
            document.getElementById('qr-view-sku').textContent = sku;
            document.getElementById('qr-view-modal').classList.remove('hidden');
            document.getElementById('qr-view-modal').classList.add('flex');
            try {
                new QRCode(container, { text: sku, width: 200, height: 200, colorDark: '#15181D', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
                currentQRCode = sku;
            } catch (error) { showToast('Erro ao gerar QR Code', 'error'); }
        }

        function closeQRViewModal() {
            document.getElementById('qr-view-modal').classList.add('hidden');
            document.getElementById('qr-view-modal').classList.remove('flex');
        }

        function baixarQRCodeView() {
            const canvas = document.querySelector('#qr-view-container canvas');
            if (!canvas) return;
            const link = document.createElement('a');
            link.download = `qr_${currentQRCode || 'material'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        // ============================================================
        // MODAIS
        // ============================================================
        function openModal() {
            document.getElementById('materialForm').reset();
            document.getElementById('item-id').value = '';
            document.getElementById('modal-title').textContent = 'Novo Material';
            document.getElementById('modal').classList.remove('hidden');
            document.getElementById('modal').classList.add('flex');
            carregarFamilias();
        }

        function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            document.getElementById('modal').classList.remove('flex');
        }

        function setSaving(isSaving) {
            const btn = document.getElementById('save-btn');
            const text = document.getElementById('save-btn-text');
            if (!btn) return;
            btn.disabled = isSaving;
            btn.classList.toggle('opacity-70', isSaving);
            text.textContent = isSaving ? 'Salvando…' : 'Cadastrar';
        }

        async function saveMaterial(e) {
            e.preventDefault();
            setSaving(true);

            const sku = document.getElementById('item-sku').value.trim();
            const nome = document.getElementById('item-name').value.trim();
            const descricao = document.getElementById('item-descricao').value.trim();
            const categoria = document.getElementById('item-categoria').value;
            const localizacao = document.getElementById('item-localizacao').value.trim();
            const quantidade = parseInt(document.getElementById('item-qty').value) || 0;
            const estoque_minimo = parseInt(document.getElementById('item-min').value) || 0;

            if (!sku || !nome) { showToast('SKU e nome são obrigatórios', 'error'); setSaving(false); return; }

            try {
                const res = await fetch(`${API_URL}/materiais`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sku, nome, descricao, categoria, localizacao, quantidade, estoque_minimo })
                });
                if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro'); }
                closeModal();
                showToast('Material cadastrado com sucesso!', 'success');
                await carregarDados();
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                setSaving(false);
            }
        }

        // ============================================================
        // ARQUIVAMENTO
        // ============================================================
        function openArchiveModal(id) {
            document.getElementById('archive-item-id').value = id;
            document.getElementById('archive-reason').value = '';
            document.getElementById('archive-modal').classList.remove('hidden');
            document.getElementById('archive-modal').classList.add('flex');
        }

        function closeArchiveModal() {
            document.getElementById('archive-modal').classList.add('hidden');
            document.getElementById('archive-modal').classList.remove('flex');
        }

        async function confirmArchive(e) {
            e.preventDefault();
            const id = document.getElementById('archive-item-id').value;
            const motivo = document.getElementById('archive-reason').value.trim() || 'Arquivado';
            const material = inventory.find(i => i.id === id);
            if (!material) return showToast('Material não encontrado', 'error');

            try {
                const res = await fetch(`${API_URL}/materiais/${material.sku}/arquivar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ motivo })
                });
                if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro'); }
                closeArchiveModal();
                showToast('Material arquivado com sucesso', 'success');
                await carregarDados();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }

        // ============================================================
        // CONFIRMAÇÃO
        // ============================================================
        function openConfirmModal({ title, message, confirmLabel = 'Confirmar', icon = 'trash-2', tone = 'danger', onConfirm }) {
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-message').textContent = message;
            const btn = document.getElementById('confirm-btn');
            btn.textContent = confirmLabel;
            btn.className = tone === 'danger' 
                ? 'px-5 py-2.5 bg-senai hover:bg-senai-dark text-white rounded-lg font-semibold text-sm transition'
                : 'px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition';
            const wrap = document.getElementById('confirm-icon-wrap');
            wrap.className = tone === 'danger' 
                ? 'w-10 h-10 rounded-full bg-red-50 text-senai flex items-center justify-center'
                : 'w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center';
            wrap.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5"></i>`;
            pendingConfirmAction = onConfirm;
            document.getElementById('confirm-modal').classList.remove('hidden');
            document.getElementById('confirm-modal').classList.add('flex');
            if (window.lucide) lucide.createIcons();
        }

        function closeConfirmModal() {
            document.getElementById('confirm-modal').classList.add('hidden');
            document.getElementById('confirm-modal').classList.remove('flex');
            pendingConfirmAction = null;
        }

        document.getElementById('confirm-btn')?.addEventListener('click', async () => {
            if (typeof pendingConfirmAction === 'function') { await pendingConfirmAction(); }
            closeConfirmModal();
        });

        function openRestoreModal(id) {
            openConfirmModal({
                title: 'Restaurar material',
                message: 'Deseja reativar este item?',
                confirmLabel: 'Restaurar',
                icon: 'rotate-ccw',
                tone: 'success',
                onConfirm: () => restoreItem(id)
            });
        }

        function openDeleteModal(id) {
            openConfirmModal({
                title: 'Excluir permanentemente',
                message: 'Essa ação não pode ser desfeita.',
                confirmLabel: 'Excluir',
                icon: 'trash-2',
                tone: 'danger',
                onConfirm: () => deleteItem(id)
            });
        }

        // ============================================================
        // AÇÕES
        // ============================================================
        async function restoreItem(id) {
            const material = inventory.find(i => i.id === id);
            if (!material) return showToast('Material não encontrado', 'error');
            try {
                const res = await fetch(`${API_URL}/materiais/${material.sku}/restaurar`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro'); }
                showToast('Material restaurado com sucesso', 'success');
                await carregarDados();
            } catch (error) { showToast(error.message, 'error'); }
        }

        async function deleteItem(id) {
            const material = inventory.find(i => i.id === id);
            if (!material) return showToast('Material não encontrado', 'error');
            try {
                const res = await fetch(`${API_URL}/materiais/${material.sku}`, { 
                    method: 'DELETE' 
                });
                if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Erro'); }
                showToast('Material excluído com sucesso', 'success');
                await carregarDados();
            } catch (error) { showToast(error.message, 'error'); }
        }

        // ============================================================
        // EXPORTAÇÃO
        // ============================================================
        function exportarDados() {
            const data = { inventario: inventory, movimentacoes: movimentacoes, exportado_em: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `almoxarifado_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Dados exportados com sucesso!', 'success');
        }

        // ============================================================
        // EVENTOS E INICIALIZAÇÃO
        // ============================================================
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { closeModal(); closeArchiveModal(); closeConfirmModal(); closeQRViewModal(); }
        });

        [['modal', closeModal], ['archive-modal', closeArchiveModal], ['confirm-modal', closeConfirmModal], ['qr-view-modal', closeQRViewModal]]
        .forEach(([id, close]) => {
            document.getElementById(id)?.addEventListener('click', (e) => { if (e.target.id === id) close(); });
        });

        document.addEventListener('DOMContentLoaded', () => {
            if (window.lucide) lucide.createIcons();
            carregarDados();
            carregarFamilias();
            setInterval(() => { if (!document.hidden) carregarDados(); }, 30000);
        });
    </script>
</body>
</html>
