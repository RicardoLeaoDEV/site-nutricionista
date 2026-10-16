/**
 * ApexFit - Guia Visual 3D de Execução Anatômica de Exercícios
 * Sistema de visualização anatômica com avatar 3D animado mostrando
 * o recrutamento muscular em destaque (vermelho/laranja), postura e biomecânica.
 */

(function (window) {
    'use strict';

    // Base do CDN do repositório de animações anatômicas 3D
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0';

    // Banco de Dados Especializado de Exercícios com Modelo Anatômico 3D
    const BANCO_EXERCICIOS_3D = {
        // --- BÍCEPS ---
        'rosca direta': {
            slug: 'barbell-curl',
            categoria: 'Bíceps',
            nomeFormatado: 'Rosca Direta com Barra',
            localGif: 'assets/exercicios/rosca-direta-anatomia.gif',
            localPng: 'assets/exercicios/rosca-direta-anatomia.png',
            cdnGif: `${CDN_BASE}/biceps/barbell-curl.gif`,
            musculoAlvo: 'Bíceps Braquial (Cabeça Longa & Curta)',
            musculosSecundarios: 'Braquial Anterior, Braquiorradial e Flexores do Antebraço',
            equipamento: 'Barra Reta ou Barra W',
            posicaoInicial: 'Em pé, pés na largura dos ombros, peito aberto, escápulas retraídas e cotovelos alinhados e firmes junto ao tronco.',
            movimentoConcentrico: 'Flexione os cotovelos elevando a barra em direção ao peito, sem movimentar os cotovelos para frente ou balançar a coluna.',
            movimentoExcentrico: 'Desça o peso de forma controlada (2 a 3 segundos) até estender quase completamente os braços, mantendo a tensão.',
            errosComuns: 'Jogar o quadril ou lombar para criar impulso; abrir excessivamente os cotovelos; descer o peso sem controle.',
            dicaPro: 'Mantenha os punhos ligeiramente neutros para concentrar todo o estresse no ventre muscular do bíceps.'
        },
        'rosca alternada': {
            slug: 'dumbbell-alternate-biceps-curl',
            categoria: 'Bíceps',
            nomeFormatado: 'Rosca Alternada com Halteres',
            localGif: null,
            cdnGif: `${CDN_BASE}/biceps/dumbbell-biceps-curl.gif`,
            musculoAlvo: 'Bíceps Braquial com Supinação',
            musculosSecundarios: 'Braquial e Antebraços',
            equipamento: 'Halteres',
            posicaoInicial: 'Em pé ou sentado em banco reto, halteres ao lado do corpo com pegada neutra.',
            movimentoConcentrico: 'Inicie a subida rotacionando o punho para fora (supinação) para ativação máxima no topo da contração.',
            movimentoExcentrico: 'Retorne lentamente girando o punho de volta para a pegada neutra.',
            errosComuns: 'Fazer o movimento rápido sem supinar o punho; projetar os ombros para frente.',
            dicaPro: 'Faça a pausa isométrica de 1 segundo no ápice de cada repetição para intensificar a contração.'
        },
        'rosca martelo': {
            slug: 'dumbbell-hammer-curl',
            categoria: 'Bíceps',
            nomeFormatado: 'Rosca Martelo com Halteres',
            localGif: 'assets/exercicios/rosca-martelo.gif',
            cdnGif: `${CDN_BASE}/biceps/dumbbell-hammer-curl.gif`,
            musculoAlvo: 'Braquial Anterior & Braquiorradial',
            musculosSecundarios: 'Bíceps Braquial e Extensores do Carpo',
            equipamento: 'Halteres',
            posicaoInicial: 'Pegada neutra (palmas voltadas uma para a outra), tronco ereto e estável.',
            movimentoConcentrico: 'Eleve os halteres mantendo a pegada neutra durante todo o trajeto.',
            movimentoExcentrico: 'Desça cadenciado resistindo à gravidade até os braços ficarem estendidos.',
            errosComuns: 'Rotacionar as palmas durante a subida; soltar os cotovelos para trás.',
            dicaPro: 'Excelente exercício para aumentar a espessura aparente do braço e fortalecer o antebraço.'
        },
        'rosca scott': {
            slug: 'barbell-preacher-curl',
            categoria: 'Bíceps',
            nomeFormatado: 'Rosca Scott com Barra W',
            localGif: null,
            cdnGif: `${CDN_BASE}/biceps/barbell-preacher-curl.gif`,
            musculoAlvo: 'Bíceps Braquial (Cabeça Curta / Isolamento)',
            musculosSecundarios: 'Braquial e Pronador Redondo',
            equipamento: 'Banco Scott & Barra W',
            posicaoInicial: 'Axilas bem encaixadas no topo do estofado, braços apoiados uniformemente na descida.',
            movimentoConcentrico: 'Flexione os cotovelos subindo até a perpendicular do chão sem perder a tensão.',
            movimentoExcentrico: 'Desça de forma extremamente controlada, evitando hiperestender os cotovelos no final.',
            errosComuns: 'Tirar o peito ou axilas do apoio; soltar o peso abruptamente embaixo (risco articular).',
            dicaPro: 'Pare 5 graus antes da hiperextensão total para proteger a articulação do cotovelo e manter a tensão constante.'
        },
        'rosca concentrada': {
            slug: 'dumbbell-concentration-curl',
            categoria: 'Bíceps',
            nomeFormatado: 'Rosca Concentrada com Haltere',
            localGif: null,
            cdnGif: `${CDN_BASE}/biceps/dumbbell-concentration-curl.gif`,
            musculoAlvo: 'Pico do Bíceps Braquial',
            musculosSecundarios: 'Braquial Anterior',
            equipamento: 'Haltere & Banco',
            posicaoInicial: 'Sentado com as pernas afastadas, cotovelo apoiado na parte interna da coxa.',
            movimentoConcentrico: 'Puxe o haltere em direção ao queixo mantendo o braço firmemente estabilizado na coxa.',
            movimentoExcentrico: 'Desça lentamente até alongar o bíceps.',
            errosComuns: 'Movimentar a perna ou balançar as costas para puxar o peso.',
            dicaPro: 'Isole completamente sem usar nenhuma alavanca corporal.'
        },

        // --- PEITORAL ---
        'supino reto com barra': {
            slug: 'barbell-bench-press',
            categoria: 'Peito',
            nomeFormatado: 'Supino Reto com Barra',
            localGif: 'assets/exercicios/supino-reto.gif',
            cdnGif: `${CDN_BASE}/pectorals/barbell-bench-press.gif`,
            musculoAlvo: 'Peitoral Maior (Porção Esternocostal)',
            musculosSecundarios: 'Deltóide Anterior e Tríceps Braquial',
            equipamento: 'Banco Reto & Barra Olímpica',
            posicaoInicial: 'Deitado no banco, olhos sob a barra, escápulas aduzidas e deprimidas ("travadas no banco"), pés cravados no chão.',
            movimentoConcentrico: 'Empurre a barra verticalmente em trajetória levemente diagonal sobre o peito.',
            movimentoExcentrico: 'Desça a barra controladamente tocando suavemente na linha dos mamilos, cotovelos a ~70° do tronco.',
            errosComuns: 'Abrir cotovelos a 90° (sobrecarrega manguito rotador); quicar a barra no esterno; perder a retração escapular.',
            dicaPro: 'Pense em "esmagar os cotovelos para dentro" durante a subida para ativar o miolo do peitoral.'
        },
        'supino reto com halteres': {
            slug: 'dumbbell-bench-press',
            categoria: 'Peito',
            nomeFormatado: 'Supino Reto com Halteres',
            localGif: null,
            cdnGif: `${CDN_BASE}/pectorals/dumbbell-bench-press.gif`,
            musculoAlvo: 'Peitoral Maior (Amplitude Livre)',
            musculosSecundarios: 'Deltóide Anterior e Tríceps',
            equipamento: 'Halteres & Banco Reto',
            posicaoInicial: 'Deitado, halteres na altura do peito, punhos alinhados com antebraços.',
            movimentoConcentrico: 'Empurre unindo os halteres no alto em formato de arco suave, sem encostar um no outro.',
            movimentoExcentrico: 'Desça até sentir um bom alongamento das fibras do peitoral.',
            errosComuns: 'Bater os halteres com força no topo; descida assimétrica.',
            dicaPro: 'Aproveite a liberdade do haltere para conseguir maior amplitude de alongamento que a barra.'
        },
        'supino inclinado': {
            slug: 'barbell-incline-bench-press',
            categoria: 'Peito',
            nomeFormatado: 'Supino Inclinado com Barra',
            localGif: null,
            cdnGif: `${CDN_BASE}/pectorals/barbell-incline-bench-press.gif`,
            musculoAlvo: 'Peitoral Maior (Porção Clavicular / Superior)',
            musculosSecundarios: 'Deltóide Anterior e Tríceps',
            equipamento: 'Banco Inclinado (30° a 45°) & Barra',
            posicaoInicial: 'Apoiado em banco inclinado a ~30° a 40°, escápulas travadas, pegada na largura dos ombros.',
            movimentoConcentrico: 'Empurre para cima e ligeiramente para trás em direção aos olhos.',
            movimentoExcentrico: 'Desça controladamente até a altura da clavícula/parte superior do peitoral.',
            errosComuns: 'Inclinar o banco além de 45° (transforma o exercício em desenvolvimento de ombro).',
            dicaPro: 'A angulação ideal para peitoral superior fica entre 30° e 35°.'
        },
        'peck deck': {
            slug: 'lever-seated-fly',
            categoria: 'Peito',
            nomeFormatado: 'Crucifixo na Máquina / Peck Deck / Voador',
            localGif: null,
            cdnGif: `${CDN_BASE}/pectorals/lever-seated-fly.gif`,
            musculoAlvo: 'Peitoral Maior (Isolamento)',
            musculosSecundarios: 'Deltóide Anterior',
            equipamento: 'Máquina Peck Deck / Voador',
            posicaoInicial: 'Banco regulado na altura em que os pegadores fiquem na linha do meio do peitoral, peito estufado.',
            movimentoConcentrico: 'Aduza os braços trazendo as mãos ou apoios até quase encostarem, esmagando o peito.',
            movimentoExcentrico: 'Abra devagar mantendo ligeira flexão de cotovelos, sem hiperestender a cápsula do ombro.',
            errosComuns: 'Desencostar as costas do banco na fase final; abrir demais os braços além do limite articular.',
            dicaPro: 'Segure 1 segundo de contração máxima de pico a cada repetição.'
        },
        'crossover': {
            slug: 'cable-middle-fly',
            categoria: 'Peito',
            nomeFormatado: 'Crossover na Polia Média / Alta',
            localGif: null,
            cdnGif: `${CDN_BASE}/pectorals/cable-middle-fly.gif`,
            musculoAlvo: 'Peitoral Maior (Adução Horizontal)',
            musculosSecundarios: 'Deltóide Anterior e Coracobraquial',
            equipamento: 'Polia Dupla (Cabo)',
            posicaoInicial: 'Um pé à frente para estabilidade, tronco levemente inclinado, cotovelos levemente flexionados.',
            movimentoConcentrico: 'Puxe as manoplas para frente e para o centro, como se estivesse abraçando uma árvore.',
            movimentoExcentrico: 'Abra os braços sentindo o alongamento do peito com controle contínuo dos cabos.',
            errosComuns: 'Usar o peso do corpo para empurrar o cabo para baixo; estender e dobrar os cotovelos durante o movimento.',
            dicaPro: 'Mantenha o ângulo dos cotovelos congelado do início ao fim.'
        },
        'flexao de braco': {
            slug: 'push-up',
            categoria: 'Peito',
            nomeFormatado: 'Flexão de Braço no Solo',
            localGif: null,
            cdnGif: `${CDN_BASE}/pectorals/push-up.gif`,
            musculoAlvo: 'Peitoral Maior & Core',
            musculosSecundarios: 'Tríceps, Deltóide Anterior e Serrátil',
            equipamento: 'Peso Corporal',
            posicaoInicial: 'Prancha alta, mãos na linha dos ombros, glúteos e abdômen contraídos.',
            movimentoConcentrico: 'Empurre o solo com força até estender os braços, mantendo o corpo rígido como uma tábua.',
            movimentoExcentrico: 'Desça até o peito quase tocar o chão, cotovelos em formato de seta (~45°).',
            errosComuns: 'Deixar o quadril cair ou levantar a bunda em triângulo; cabeça projetada para frente.',
            dicaPro: 'Ative o abdômen o tempo todo para transferir força e proteger a lombar.'
        },

        // --- COSTAS & DORSAIS ---
        'puxada alta': {
            slug: 'cable-pulldown',
            categoria: 'Costas',
            nomeFormatado: 'Puxada Alta no Pulley (Lat Pulldown)',
            localGif: 'assets/exercicios/puxada-alta.gif',
            cdnGif: `${CDN_BASE}/lats/cable-pulldown.gif`,
            musculoAlvo: 'Latíssimo do Dorso (Grande Dorsal)',
            musculosSecundarios: 'Bíceps, Braquial, Rombóides e Redondo Maior',
            equipamento: 'Puxador / Polia Alta com Barra Reta',
            posicaoInicial: 'Sentado com coxas firmes sob o rolo de apoio, tronco ereto ou levemente inclinado (10-15°), peito aberto.',
            movimentoConcentrico: 'Puxe a barra em direção à clavícula/parte alta do peito, puxando com os cotovelos apontados para o chão.',
            movimentoExcentrico: 'Retorne a barra lentamente até alongar completamente as dorsais no topo.',
            errosComuns: 'Puxar a barra atrás da nuca (risco cervical); reclinar o corpo quase na horizontal balançando a lombar.',
            dicaPro: 'Não pense em puxar com as mãos; pense em cravar os cotovelos nos bolsos da calça.'
        },
        'remada curvada': {
            slug: 'barbell-bent-over-row',
            categoria: 'Costas',
            nomeFormatado: 'Remada Curvada com Barra',
            localGif: 'assets/exercicios/remada-curvada.gif',
            cdnGif: `${CDN_BASE}/upper-back/barbell-bent-over-row.gif`,
            musculoAlvo: 'Dorsais Médios, Rombóides e Trapézio',
            musculosSecundarios: 'Bíceps, Eretores da Espinha e Posterior de Coxa',
            equipamento: 'Barra Olímpica',
            posicaoInicial: 'Joelhos semiflexionados, quadril para trás, coluna em ângulo neutro de ~45°, abdômen travado.',
            movimentoConcentrico: 'Puxe a barra em direção ao umbigo aproximando as escápulas com vigor.',
            movimentoExcentrico: 'Desça controladamente sem perder a postura da coluna.',
            errosComuns: 'Arredondar a coluna lombar; ficar muito ereto diminuindo a alavanca das costas.',
            dicaPro: 'Contraia fortemente as escápulas na contração para construir espessura dorsal.'
        },
        'remada baixa': {
            slug: 'cable-seated-row',
            categoria: 'Costas',
            nomeFormatado: 'Remada Baixa no Triângulo',
            localGif: null,
            cdnGif: `${CDN_BASE}/upper-back/cable-seated-row.gif`,
            musculoAlvo: 'Espessura Dorsal & Rombóides',
            musculosSecundarios: 'Bíceps, Trapézio e Latíssimo',
            equipamento: 'Polia Baixa com Puxador Triângulo',
            posicaoInicial: 'Sentado com os pés na plataforma, joelhos ligeiramente flexionados, coluna neutra.',
            movimentoConcentrico: 'Puxe o triângulo contra o abdômen estufando o peito e unindo as escápulas.',
            movimentoExcentrico: 'Permita que as escápulas se abram ligeiramente na volta mantendo a coluna lombar estável.',
            errosComuns: 'Balançar as costas para frente e para trás feito remo de barco.',
            dicaPro: 'Mantenha o tronco quase fixo e concentre o movimento na movimentação escapular.'
        },
        'barra fixa': {
            slug: 'pull-up',
            categoria: 'Costas',
            nomeFormatado: 'Barra Fixa Pronada (Pull-up)',
            localGif: null,
            cdnGif: `${CDN_BASE}/lats/pull-up.gif`,
            musculoAlvo: 'Latíssimo do Dorso & Força Geral',
            musculosSecundarios: 'Bíceps, Braquial, Core e Trapézio',
            equipamento: 'Barra Fixa',
            posicaoInicial: 'Suspenso pela pegada pronada na largura dos ombros, pernas unidas.',
            movimentoConcentrico: 'Puxe o corpo para cima até o queixo passar da linha da barra.',
            movimentoExcentrico: 'Desça de forma totalmente controlada até a extensão quase completa dos braços.',
            errosComuns: 'Girar o corpo e chutar o ar ("kipping"); descer despencando.',
            dicaPro: 'Inicie a puxada com a depressão das escápulas antes de dobrar os braços.'
        },

        // --- OMBROS & DELTÓIDES ---
        'desenvolvimento': {
            slug: 'dumbbell-seated-shoulder-press',
            categoria: 'Ombros',
            nomeFormatado: 'Desenvolvimento com Halteres (Sentado)',
            localGif: 'assets/exercicios/desenvolvimento.gif',
            cdnGif: `${CDN_BASE}/delts/dumbbell-seated-shoulder-press.gif`,
            musculoAlvo: 'Deltóide Anterior & Lateral',
            musculosSecundarios: 'Tríceps Braquial e Trapézio Superior',
            equipamento: 'Banco Regulado (75° a 80°) & Halteres',
            posicaoInicial: 'Sentado com as costas firmes no encosto, halteres na altura das orelhas, cotovelos levemente à frente.',
            movimentoConcentrico: 'Empurre os halteres para cima até quase estender os cotovelos sem bater as anilhas.',
            movimentoExcentrico: 'Desça até a linha dos queixos/orelhas sentindo a carga nos ombros.',
            errosComuns: 'Arquear excessivamente a lombar afastando a bunda do encosto; cotovelos muito para trás.',
            dicaPro: 'Empurre ligeiramente em direção ao teto, mantendo a cabeça neutra e olhar para a frente.'
        },
        'elevacao lateral': {
            slug: 'dumbbell-lateral-raise',
            categoria: 'Ombros',
            nomeFormatado: 'Elevação Lateral com Halteres',
            localGif: 'assets/exercicios/elevacao-lateral.gif',
            cdnGif: `${CDN_BASE}/delts/dumbbell-lateral-raise.gif`,
            musculoAlvo: 'Deltóide Lateral (Largura dos Ombros)',
            musculosSecundarios: 'Deltóide Anterior e Trapézio',
            equipamento: 'Halteres',
            posicaoInicial: 'Em pé, tronco com inclinação sutil à frente (5°), halteres à frente das coxas.',
            movimentoConcentrico: 'Eleve os halteres lateralmente pelos cotovelos até a linha dos ombros, não mais alto.',
            movimentoExcentrico: 'Segure a descida em 2 segundos sem deixar o peso despencar na lateral.',
            errosComuns: 'Encolher os ombros ativando trapézio; dar impulso com as pernas; subir os punhos acima dos cotovelos.',
            dicaPro: 'Pense em "afastar os pesos para longe do corpo" e não simplesmente levantá-los para cima.'
        },
        'elevacao frontal': {
            slug: 'dumbbell-front-raise',
            categoria: 'Ombros',
            nomeFormatado: 'Elevação Frontal com Halteres',
            localGif: null,
            cdnGif: `${CDN_BASE}/delts/dumbbell-front-raise.gif`,
            musculoAlvo: 'Deltóide Anterior (Frente do Ombro)',
            musculosSecundarios: 'Peitoral Superior e Trapézio',
            equipamento: 'Halteres ou Anilha',
            posicaoInicial: 'Em pé, halteres sobre as coxas com pegada pronada ou neutra.',
            movimentoConcentrico: 'Eleve um ou ambos os braços até a altura dos olhos com cotovelos quase esticados.',
            movimentoExcentrico: 'Desça lentamente sem balançar o tronco.',
            errosComuns: 'Balançar a coluna para trás para arremessar o peso.',
            dicaPro: 'Mantenha o abdômen comprimido para evitar hiperextensão lombar.'
        },
        'remada alta': {
            slug: 'barbell-upright-row',
            categoria: 'Ombros',
            nomeFormatado: 'Remada Alta na Barra / Polia',
            localGif: null,
            cdnGif: `${CDN_BASE}/delts/barbell-upright-row.gif`,
            musculoAlvo: 'Trapézio & Deltóide Lateral',
            musculosSecundarios: 'Bíceps e Antebraço',
            equipamento: 'Barra W ou Cabo',
            posicaoInicial: 'Em pé com pegada média (distância igual ou superior à largura dos ombros).',
            movimentoConcentrico: 'Puxe a barra verticalmente até a altura do peito, com os cotovelos liderando a subida.',
            movimentoExcentrico: 'Desça de forma suave e contínua.',
            errosComuns: 'Pegada excessivamente fechada (risco de pinçamento no ombro).',
            dicaPro: 'A pegada ligeiramente mais aberta é infinitamente mais segura para a articulação do ombro.'
        },

        // --- TRÍCEPS ---
        'triceps pulley': {
            slug: 'cable-pushdown',
            categoria: 'Tríceps',
            nomeFormatado: 'Tríceps Pulley na Barra Reta / V',
            localGif: null,
            cdnGif: `${CDN_BASE}/triceps/cable-pushdown.gif`,
            musculoAlvo: 'Tríceps Braquial (Cabeça Lateral & Medial)',
            musculosSecundarios: 'Ancôneo',
            equipamento: 'Polia Alta com Barra Reta ou em V',
            posicaoInicial: 'Em pé, cotovelos colados às costelas, tronco levemente inclinado à frente, pegada pronada.',
            movimentoConcentrico: 'Estenda completamente os cotovelos empurrando a barra para baixo com força.',
            movimentoExcentrico: 'Deixe a barra subir até o ângulo de 90° sem desgrudar os cotovelos das laterais do corpo.',
            errosComuns: 'Deixar os cotovelos subirem e descerem; usar o peso corporal para empurrar.',
            dicaPro: 'Trave os cotovelos como se fossem dobradiças presas às costelas.'
        },
        'triceps corda': {
            slug: 'cable-pushdown-with-rope-attachment',
            categoria: 'Tríceps',
            nomeFormatado: 'Tríceps Corda na Polia',
            localGif: 'assets/exercicios/triceps-corda.gif',
            cdnGif: `${CDN_BASE}/triceps/cable-pushdown-with-rope-attachment.gif`,
            musculoAlvo: 'Tríceps Braquial (Cabeça Lateral e Pico)',
            musculosSecundarios: 'Ancôneo e Antebraços',
            equipamento: 'Polia Alta com Corda',
            posicaoInicial: 'Cotovelos junto ao corpo, pegada neutra segurando nas extremidades da corda.',
            movimentoConcentrico: 'Estenda os braços e no final do percurso abra a corda para os lados contraindo os tríceps.',
            movimentoExcentrico: 'Volte controlando até que os antebraços passem ligeiramente dos 90°.',
            errosComuns: 'Não abrir a corda embaixo; balançar os ombros para ajudar na descida.',
            dicaPro: 'Abertura da corda no final é o que ativa a cabeça lateral com intensidade máxima.'
        },
        'triceps testa': {
            slug: 'barbell-lying-triceps-extension',
            categoria: 'Tríceps',
            nomeFormatado: 'Tríceps Testa com Barra W',
            localGif: 'assets/exercicios/triceps-testa.gif',
            cdnGif: `${CDN_BASE}/triceps/barbell-lying-triceps-extension.gif`,
            musculoAlvo: 'Tríceps Braquial (Cabeça Longa & Medial)',
            musculosSecundarios: 'Ancôneo',
            equipamento: 'Banco Reto & Barra W',
            posicaoInicial: 'Deitado no banco, braços estendidos ligeiramente inclinados para trás em direção à testa.',
            movimentoExcentrico: 'Flexione apenas os cotovelos descendo a barra controladamente em direção à testa ou topo da cabeça.',
            movimentoConcentrico: 'Estenda os braços voltando à posição inicial sem abrir os cotovelos para os lados.',
            errosComuns: 'Abrir os cotovelos durante a descida; bater a barra na testa por falta de controle.',
            dicaPro: 'Manter os braços ligeiramente inclinados para trás em vez de verticais mantém a tensão contínua no tríceps no topo.'
        },
        'triceps frances': {
            slug: 'dumbbell-seated-triceps-extension',
            categoria: 'Tríceps',
            nomeFormatado: 'Tríceps Francês com Haltere (Sentado)',
            localGif: null,
            cdnGif: `${CDN_BASE}/triceps/dumbbell-seated-triceps-extension.gif`,
            musculoAlvo: 'Cabeça Longa do Tríceps (Alongamento Máximo)',
            musculosSecundarios: 'Ancôneo',
            equipamento: 'Haltere & Banco com encosto curto',
            posicaoInicial: 'Sentado com a coluna reta, segurando um haltere com as duas mãos acima da cabeça.',
            movimentoExcentrico: 'Desça o haltere por trás da cabeça flexionando os cotovelos até sentir alongamento profundo.',
            movimentoConcentrico: 'Empurre o peso de volta acima da cabeça estendendo os cotovelos.',
            errosComuns: 'Abrir os cotovelos excessivamente; arquear as costas soltando o core.',
            dicaPro: 'Excelente para quem busca hipertrofia na cabeça longa do tríceps.'
        },
        'mergulho': {
            slug: 'triceps-dip-between-benches',
            categoria: 'Tríceps',
            nomeFormatado: 'Mergulho entre Bancos / Paralelas',
            localGif: null,
            cdnGif: `${CDN_BASE}/triceps/triceps-dip-between-benches.gif`,
            musculoAlvo: 'Tríceps Braquial & Peitoral Inferior',
            musculosSecundarios: 'Deltóide Anterior',
            equipamento: 'Bancos ou Barras Paralelas',
            posicaoInicial: 'Mãos apoiadas no banco na largura do quadril, pernas esticadas à frente.',
            movimentoExcentrico: 'Flexione os cotovelos descendo o quadril rente ao banco até formar ~90° nos cotovelos.',
            movimentoConcentrico: 'Empurre com a palma das mãos estendendo os braços de volta.',
            errosComuns: 'Afastar o quadril do banco projetando o ombro para rotação interna perigosa.',
            dicaPro: 'Desça rente ao banco para proteger a cápsula articular do ombro.'
        },

        // --- QUADRÍCEPS & PERNAS ---
        'agachamento livre': {
            slug: 'barbell-full-squat',
            categoria: 'Pernas',
            nomeFormatado: 'Agachamento Livre com Barra',
            localGif: 'assets/exercicios/agachamento-livre.gif',
            cdnGif: `${CDN_BASE}/glutes/barbell-full-squat.gif`,
            musculoAlvo: 'Quadríceps, Glúteo Máximo e Core',
            musculosSecundarios: 'Isquiotibiais, Adutores e Eretores da Coluna',
            equipamento: 'Gaiola de Agachamento & Barra Olímpica',
            posicaoInicial: 'Barra apoiada sobre o trapézio, pés um pouco além da largura dos ombros com pontas sutilmente abertas.',
            movimentoExcentrico: 'Inicie dobrando os joelhos e empurrando o quadril para trás como se fosse sentar em um banco baixo, descendo com a coluna neutra.',
            movimentoConcentrico: 'Empurre o chão através dos calcanhares e meio do pé até retornar à posição ereta.',
            errosComuns: 'Valgo dinâmico (joelhos caindo para dentro); tirar calcanhares do solo; arredondar a lombar.',
            dicaPro: 'Imagine que você está "espalhando o chão com os pés" durante a subida para ativar o glúteo.'
        },
        'leg press': {
            slug: 'sled-45-leg-press',
            categoria: 'Pernas',
            nomeFormatado: 'Leg Press 45°',
            localGif: 'assets/exercicios/leg-press-45.gif',
            cdnGif: `${CDN_BASE}/glutes/sled-45-leg-press.gif`,
            musculoAlvo: 'Quadríceps & Glúteos',
            musculosSecundarios: 'Isquiotibiais e Panturrilhas',
            equipamento: 'Aparelho Leg Press 45°',
            posicaoInicial: 'Costas e glúteos 100% apoiados no encosto, pés na plataforma na largura dos ombros.',
            movimentoExcentrico: 'Destrave a máquina e desça a plataforma flexionando os joelhos até ~90° sem tirar o cóccix do banco.',
            movimentoConcentrico: 'Empurre a plataforma de volta sem bloquear totalmente ou hiperextender os joelhos no topo.',
            errosComuns: 'Tirar o glúteo/lombar do encosto na descida profunda; travar os joelhos com estalo no topo.',
            dicaPro: 'Nunca bloqueie a articulação do joelho no topo; mantenha leve microflexão constante.'
        },
        'cadeira extensora': {
            slug: 'lever-leg-extension',
            categoria: 'Pernas',
            nomeFormatado: 'Cadeira Extensora',
            localGif: 'assets/exercicios/cadeira-extensora.gif',
            cdnGif: `${CDN_BASE}/quads/lever-leg-extension.gif`,
            musculoAlvo: 'Quadríceps (Isolamento)',
            musculosSecundarios: 'Reto Femoral e Vasto Lateral',
            equipamento: 'Máquina Cadeira Extensora',
            posicaoInicial: 'Eixo da máquina alinhado ao joelho, almofada sobre a parte inferior da tíbia (acima dos pés), costas apoiadas.',
            movimentoConcentrico: 'Estenda os joelhos até contrair ao máximo os quadríceps, segurando 1s no topo.',
            movimentoExcentrico: 'Desça de forma cadenciada em 3 segundos sem deixar as placas de peso baterem.',
            errosComuns: 'Dar tranco com o quadril; chutar o rolete sem controle excêntrico.',
            dicaPro: 'Segure firmemente nas manoplas laterais para manter a pelve colada no banco.'
        },
        'agachamento bulgaro': {
            slug: 'dumbbell-single-leg-split-squat',
            categoria: 'Pernas',
            nomeFormatado: 'Agachamento Búlgaro com Halteres',
            localGif: null,
            cdnGif: `${CDN_BASE}/quads/dumbbell-single-leg-split-squat.gif`,
            musculoAlvo: 'Quadríceps, Glúteo Máximo e Estabilidade',
            musculosSecundarios: 'Isquiotibiais e Core',
            equipamento: 'Banco & Halteres',
            posicaoInicial: 'Um pé apoiado atrás no banco com peito do pé no estofado, perna da frente firme no chão.',
            movimentoExcentrico: 'Desça o quadril verticalmente flexionando o joelho da frente até formar 90°.',
            movimentoConcentrico: 'Empurre pelo calcanhar da perna da frente subindo de forma controlada.',
            errosComuns: 'Pé muito perto do banco sobrecarregando o joelho; desequilíbrio por base muito estreita.',
            dicaPro: 'Incline ligeiramente o tronco para a frente caso deseje focar ainda mais no glúteo.'
        },
        'avanco': {
            slug: 'dumbbell-lunge',
            categoria: 'Pernas',
            nomeFormatado: 'Avanço / Passada com Halteres',
            localGif: null,
            cdnGif: `${CDN_BASE}/glutes/dumbbell-lunge.gif`,
            musculoAlvo: 'Quadríceps e Glúteos',
            musculosSecundarios: 'Isquiotibiais e Adutores',
            equipamento: 'Halteres',
            posicaoInicial: 'Em pé com halteres ao lado do corpo, tronco ereto.',
            movimentoExcentrico: 'Dê um passo à frente flexionando ambos os joelhos até o joelho de trás quase tocar o chão.',
            movimentoConcentrico: 'Empurre com a perna da frente retornando ou avançando no passo.',
            errosComuns: 'Bater o joelho traseiro com força no chão; dar passos muito curtos.',
            dicaPro: 'Mantenha o peito alto e os passos na largura dos quadris para equilíbrio.'
        },

        // --- ISQUIOTIBAIS & POSTERIOR ---
        'mesa flexora': {
            slug: 'lever-lying-leg-curl',
            categoria: 'Posterior',
            nomeFormatado: 'Mesa Flexora Deitada',
            localGif: 'assets/exercicios/mesa-flexora.gif',
            cdnGif: `${CDN_BASE}/hamstrings/lever-lying-leg-curl.gif`,
            musculoAlvo: 'Isquiotibiais (Posterior de Coxa)',
            musculosSecundarios: 'Gastrocnêmio',
            equipamento: 'Máquina Mesa Flexora',
            posicaoInicial: 'Deitado de bruços, almofada regulada logo abaixo das panturrilhas, joelhos alinhados com o eixo da máquina.',
            movimentoConcentrico: 'Flexione os joelhos puxando o rolo em direção aos glúteos de forma enérgica.',
            movimentoExcentrico: 'Desça resistindo ao peso lentamente sem esticar com violência no final.',
            errosComuns: 'Levantar o quadril do estofado na hora da puxada; balançar a lombar.',
            dicaPro: 'Aperte a barriga contra o banco para isolar os isquiotibiais sem compensação na lombar.'
        },
        'stiff': {
            slug: 'barbell-straight-leg-deadlift',
            categoria: 'Posterior',
            nomeFormatado: 'Stiff com Barra ou Halteres',
            localGif: null,
            cdnGif: `${CDN_BASE}/hamstrings/barbell-straight-leg-deadlift.gif`,
            musculoAlvo: 'Isquiotibiais & Glúteo Máximo',
            musculosSecundarios: 'Eretores da Espinha e Trapézio',
            equipamento: 'Barra Olímpica ou Halteres',
            posicaoInicial: 'Em pé, pés na largura do quadril, joelhos destravados com microflexão fixa.',
            movimentoExcentrico: 'Empurre o quadril para trás dobrando a bacia, descendo a barra rente às pernas mantendo a coluna 100% reta.',
            movimentoConcentrico: 'Contraia os glúteos e isquiotibiais estendendo o quadril de volta até a posição ereta.',
            errosComuns: 'Arredondar a coluna lombar na descida; flexionar os joelhos transformando em agachamento.',
            dicaPro: 'O movimento é um "dobrar no quadril" (hinge). Pense em tocar a parede de trás com o bumbum.'
        },

        // --- GLÚTEOS ---
        'elevacao pelvica': {
            slug: 'barbell-hip-thrust',
            categoria: 'Glúteos',
            nomeFormatado: 'Elevação Pélvica com Barra (Hip Thrust)',
            localGif: null,
            cdnGif: `${CDN_BASE}/glutes/sled-45-leg-press.gif`, // fallback seguro de alta ativação
            musculoAlvo: 'Glúteo Máximo (Contração Máxima)',
            musculosSecundarios: 'Isquiotibiais e Core',
            equipamento: 'Banco Reto & Barra Acolchoada',
            posicaoInicial: 'Costas apoiadas no banco na linha das escápulas, barra acolchoada sobre a dobra do quadril, pés firmes no chão.',
            movimentoConcentrico: 'Empurre pelos calcanhares elevando a pelve até que o tronco forme uma linha reta paralela ao chão, apertando os glúteos por 2s.',
            movimentoExcentrico: 'Desça o quadril de forma controlada sem hiperestender a lombar.',
            errosComuns: 'Olhar para o teto e hiperestender a coluna lombar; pés muito à frente ou muito atrás.',
            dicaPro: 'Mantenha o queixo apontado para o peito durante todo o trajeto para travar a pelve.'
        },
        'cadeira abdutora': {
            slug: 'lever-seated-hip-abduction',
            categoria: 'Glúteos',
            nomeFormatado: 'Cadeira Abdutora',
            localGif: null,
            cdnGif: `${CDN_BASE}/glutes/sled-45-leg-press.gif`,
            musculoAlvo: 'Glúteo Médio & Mínimo',
            musculosSecundarios: 'Tensor da Fáscia Lata',
            equipamento: 'Máquina Cadeira Abdutora',
            posicaoInicial: 'Sentado com costas no encosto (ou levemente inclinado para frente), pernas encaixadas no apoio.',
            movimentoConcentrico: 'Abra as pernas com força máxima contra a resistência das almofadas.',
            movimentoExcentrico: 'Feche devagar segurando o peso antes das placas baterem.',
            errosComuns: 'Dar tranco rápido sem controlar o retorno.',
            dicaPro: 'Inclinar o tronco 30° para a frente aumenta o recrutamento das fibras superiores do glúteo médio.'
        },

        // --- PANTURRILHA ---
        'panturrilha': {
            slug: 'sled-calf-press-on-leg-press',
            categoria: 'Panturrilhas',
            nomeFormatado: 'Panturrilha no Leg Press / em Pé',
            localGif: null,
            cdnGif: `${CDN_BASE}/calves/sled-calf-press-on-leg-press.gif`,
            musculoAlvo: 'Gastrocnêmio & Sóleo',
            musculosSecundarios: 'Tibial Posterior',
            equipamento: 'Aparelho ou Leg Press',
            posicaoInicial: 'Ponta dos pés na borda da plataforma, calcanhares livres para alongar.',
            movimentoExcentrico: 'Desça os calcanhares sentindo o alongamento máximo da fáscia e tendão de Aquiles.',
            movimentoConcentrico: 'Empurre a ponta dos pés subindo o máximo possível, segurando 1 a 2 segundos no topo.',
            errosComuns: 'Fazer repetições curtas e rápidas aproveitando a elasticidade do tendão; dobrar os joelhos.',
            dicaPro: 'Faça uma pausa de 1 segundo embaixo para dissipar a energia elástica e obrigar o músculo a trabalhar.'
        },

        // --- ABDÔMEN & CORE ---
        'abdominal': {
            slug: 'cable-kneeling-crunch',
            categoria: 'Abdômen',
            nomeFormatado: 'Abdominal na Polia / Crunch',
            localGif: 'assets/exercicios/abdominal-crunch.gif',
            cdnGif: `${CDN_BASE}/abs/cable-kneeling-crunch.gif`,
            musculoAlvo: 'Reto Abdominal',
            musculosSecundarios: 'Oblíquos e Serrátil',
            equipamento: 'Polia Alta com Corda ou Solo',
            posicaoInicial: 'Ajoelhado sob a polia alta, segurando a corda junto às orelhas/têmporas.',
            movimentoConcentrico: 'Enrole a coluna trazendo as costelas em direção à bacia, soltando todo o ar na contração.',
            movimentoExcentrico: 'Retorne desenrolando a coluna com controle sem estender em excesso.',
            errosComuns: 'Sentar nos calcanhares usando o quadril em vez de flexionar a coluna vertebral.',
            dicaPro: 'A função do abdômen é aproximar as costelas da pelve; foque nessa curvatura.'
        },
        'prancha': {
            slug: 'plank',
            categoria: 'Abdômen',
            nomeFormatado: 'Prancha Isométrica',
            localGif: null,
            cdnGif: `${CDN_BASE}/abs/front-plank-with-twist.gif`,
            musculoAlvo: 'Transverso do Abdômen & Estabilidade do Core',
            musculosSecundarios: 'Glúteos, Ombros e Quadríceps',
            equipamento: 'Solo / Colchonete',
            posicaoInicial: 'Apoiado sobre os antebraços e pontas dos pés, cotovelos alinhados sob os ombros.',
            movimentoConcentrico: 'Mantenha o corpo alinhado em linha reta da cabeça aos pés por todo o tempo prescrito.',
            movimentoExcentrico: 'Isometria mantida sem deixar o quadril cair ou levantar.',
            errosComuns: 'Deixar a lombar arquear para baixo comprimindo as vértebras.',
            dicaPro: 'Ative glúteos e abdômen simultaneamente como se fosse levar um soco no estômago.'
        }
    };

    /**
     * Normaliza string removendo acentos e caracteres especiais para busca
     */
    function normalizar(texto) {
        if (!texto) return '';
        return String(texto)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .trim();
    }

    /**
     * Localiza o exercício correspondente no banco 3D ou gera fallback anatômico ideal
     */
    function obterExercicio3D(nomeExercicio, grupoMuscular, urlVideoPersonal) {
        const normNome = normalizar(nomeExercicio);
        const normGrupo = normalizar(grupoMuscular);

        // 1. Tenta correspondência exata ou por chave
        for (const [chave, dados] of Object.entries(BANCO_EXERCICIOS_3D)) {
            const normChave = normalizar(chave);
            if (normNome.includes(normChave) || normChave.includes(normNome)) {
                return formatarRetorno(dados, nomeExercicio, urlVideoPersonal);
            }
        }

        // 2. Busca por termos específicos conhecidos
        const mapaTermos = [
            { termos: ['bicep', 'rosca', 'scott', 'martelo', 'concentrad'], ref: 'rosca direta' },
            { termos: ['tricep', 'testa', 'pulley', 'frances', 'corda', 'mergulho'], ref: 'triceps corda' },
            { termos: ['supino', 'peito', 'peck', 'crucifixo', 'voador', 'cross', 'flexao'], ref: 'supino reto com barra' },
            { termos: ['puxada', 'remada', 'dorsal', 'costas', 'pulldown', 'barra fixa'], ref: 'puxada alta' },
            { termos: ['ombro', 'deltoide', 'elevacao', 'militar', 'desenvolvimento', 'lateral'], ref: 'elevacao lateral' },
            { termos: ['agachamento', 'leg press', 'extensora', 'quadriceps', 'bulgaro', 'avanco'], ref: 'agachamento livre' },
            { termos: ['flexora', 'stiff', 'posterior', 'isquio'], ref: 'mesa flexora' },
            { termos: ['gluteo', 'pelvica', 'abdutora', 'bumbum'], ref: 'elevacao pelvica' },
            { termos: ['panturrilha', 'panturilha', 'soleo'], ref: 'panturrilha' },
            { termos: ['abdomen', 'abdominal', 'prancha', 'core', 'crunch'], ref: 'abdominal' }
        ];

        for (const item of mapaTermos) {
            if (item.termos.some(t => normNome.includes(t) || normGrupo.includes(t))) {
                const dados = BANCO_EXERCICIOS_3D[item.ref];
                if (dados) return formatarRetorno(dados, nomeExercicio, urlVideoPersonal);
            }
        }

        // 3. Fallback baseado no Grupo Muscular
        if (normGrupo.includes('bicep') || normGrupo.includes('braco')) return formatarRetorno(BANCO_EXERCICIOS_3D['rosca direta'], nomeExercicio, urlVideoPersonal);
        if (normGrupo.includes('tricep')) return formatarRetorno(BANCO_EXERCICIOS_3D['triceps corda'], nomeExercicio, urlVideoPersonal);
        if (normGrupo.includes('peito') || normGrupo.includes('peitoral')) return formatarRetorno(BANCO_EXERCICIOS_3D['supino reto com barra'], nomeExercicio, urlVideoPersonal);
        if (normGrupo.includes('costa') || normGrupo.includes('dorsal')) return formatarRetorno(BANCO_EXERCICIOS_3D['puxada alta'], nomeExercicio, urlVideoPersonal);
        if (normGrupo.includes('ombro') || normGrupo.includes('deltoide')) return formatarRetorno(BANCO_EXERCICIOS_3D['desenvolvimento'], nomeExercicio, urlVideoPersonal);
        if (normGrupo.includes('perna') || normGrupo.includes('inferior') || normGrupo.includes('coxa')) return formatarRetorno(BANCO_EXERCICIOS_3D['agachamento livre'], nomeExercicio, urlVideoPersonal);
        if (normGrupo.includes('gluteo')) return formatarRetorno(BANCO_EXERCICIOS_3D['elevacao pelvica'], nomeExercicio, urlVideoPersonal);
        if (normGrupo.includes('abdo') || normGrupo.includes('core')) return formatarRetorno(BANCO_EXERCICIOS_3D['abdominal'], nomeExercicio, urlVideoPersonal);

        // Fallback mestre: Rosca Direta com o Personagem 3D (exatamente a foto do usuário)
        return formatarRetorno(BANCO_EXERCICIOS_3D['rosca direta'], nomeExercicio, urlVideoPersonal);
    }

    function formatarRetorno(dados, nomeExercicio, urlVideoPersonal) {
        // Prioriza o GIF local se existir, senão usa o CDN
        const gifFinal = dados.localGif || dados.cdnGif;
        const pngPoster = dados.localPng || dados.localGif || dados.cdnGif;

        return {
            ...dados,
            nomeExibicao: nomeExercicio || dados.nomeFormatado,
            gifUrl: gifFinal,
            posterUrl: pngPoster,
            videoPersonal: urlVideoPersonal || null
        };
    }

    /**
     * Cria e injeta o Modal Interativo de Execução 3D no DOM caso não exista
     */
    function garantirModalExecucao() {
        let modal = document.getElementById('modal-execucao-3d-exercicio');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'modal-execucao-3d-exercicio';
        modal.className = 'fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md hidden flex items-center justify-center p-3 sm:p-5 transition-opacity duration-300 opacity-0';
        modal.innerHTML = `
            <div id="modal-execucao-card" class="w-full max-w-2xl bg-slate-900/95 border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[92vh] transform scale-95 transition-transform duration-300">
                <!-- Cabeçalho do Modal -->
                <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/50 shrink-0">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                            <i data-lucide="activity" class="w-5 h-5"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span id="m3d-categoria" class="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 tracking-wider">Músculo</span>
                                <span id="m3d-equipamento" class="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">Equipamento</span>
                            </div>
                            <h3 id="m3d-titulo" class="text-base sm:text-lg font-black text-white truncate mt-0.5">Execução do Exercício</h3>
                        </div>
                    </div>
                    <button type="button" onclick="Exercise3D.fecharModal()" class="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95" title="Fechar (ESC)">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <!-- Conteúdo com Scroll -->
                <div class="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
                    
                    <!-- Palco Principal: Animação Anatômica 3D (O Personagem) -->
                    <div class="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-3 sm:p-4 flex flex-col items-center justify-center overflow-hidden group shadow-inner">
                        <!-- Selo de Modelo Anatômico -->
                        <div class="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-[10px] font-extrabold text-amber-300 shadow-md">
                            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span>Músculo em Destaque 3D</span>
                        </div>

                        <!-- Botão de Alternar Velocidade (0.5x / 1x) -->
                        <div class="absolute top-3 right-3 z-10 flex items-center gap-1">
                            <button type="button" id="btn-m3d-zoom" onclick="Exercise3D.alternarZoom()" title="Aproximar / Detalhar" class="px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-[11px] font-bold text-slate-300 transition-all flex items-center gap-1 cursor-pointer">
                                <i data-lucide="zoom-in" class="w-3.5 h-3.5 text-amber-400"></i>
                                <span class="hidden sm:inline">Zoom</span>
                            </button>
                        </div>

                        <!-- Container da Imagem Animada -->
                        <div id="m3d-media-box" class="w-full flex items-center justify-center min-h-[260px] sm:min-h-[320px] transition-transform duration-300">
                            <img id="m3d-animacao-img" src="" alt="Animação Anatômica 3D" class="max-h-[300px] sm:max-h-[360px] w-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] rounded-xl transition-all select-none pointer-events-none" loading="eager" />
                        </div>

                        <!-- Legenda de Destaque Muscular -->
                        <div class="w-full mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                            <div class="flex items-center gap-2">
                                <div class="w-3.5 h-3.5 rounded-full bg-red-500/90 shadow-sm shadow-red-500/50 shrink-0"></div>
                                <span class="text-xs text-slate-300 font-semibold">Alvo Primário: <strong id="m3d-alvo-primario" class="text-white font-extrabold">--</strong></span>
                            </div>
                            <span class="text-[11px] text-slate-400 italic">Movimento executado em biomecânica ideal</span>
                        </div>
                    </div>

                    <!-- Ficha Técnica Anatômica e Cues de Postura -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <!-- Músculos Ativados -->
                        <div class="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2">
                            <h4 class="text-xs uppercase font-extrabold text-amber-400 flex items-center gap-1.5">
                                <i data-lucide="target" class="w-3.5 h-3.5"></i>
                                Músculos Recrutados
                            </h4>
                            <div class="space-y-1.5 text-xs">
                                <div>
                                    <span class="text-slate-400 block text-[11px]">Músculo Principal:</span>
                                    <p id="m3d-musculo-principal" class="font-bold text-slate-100"></p>
                                </div>
                                <div class="pt-1 border-t border-slate-800/60">
                                    <span class="text-slate-400 block text-[11px]">Músculos Secundários & Sinergistas:</span>
                                    <p id="m3d-musculo-secundario" class="text-slate-300 text-[11px]"></p>
                                </div>
                            </div>
                        </div>

                        <!-- Cues Rápidos de Respiração e Postura -->
                        <div class="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2">
                            <h4 class="text-xs uppercase font-extrabold text-lime-400 flex items-center gap-1.5">
                                <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                                Postura & Dica Pro
                            </h4>
                            <p id="m3d-dica-pro" class="text-xs text-slate-300 leading-relaxed font-medium"></p>
                            <div class="pt-1.5 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
                                <i data-lucide="info" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>
                                <span>Cadência sugerida: 2s subida / 3s descida.</span>
                            </div>
                        </div>
                    </div>

                    <!-- Guia Passo a Passo da Execução -->
                    <div class="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
                        <h4 class="text-xs uppercase font-extrabold text-slate-200 flex items-center gap-2">
                            <i data-lucide="list-ordered" class="w-4 h-4 text-amber-400"></i>
                            Técnica Passo a Passo
                        </h4>
                        
                        <div class="space-y-2.5 text-xs text-slate-300">
                            <div class="flex items-start gap-2.5">
                                <span class="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                <div>
                                    <strong class="text-white block font-semibold">Posição Inicial:</strong>
                                    <span id="m3d-pos-inicial" class="leading-relaxed"></span>
                                </div>
                            </div>
                            <div class="flex items-start gap-2.5">
                                <span class="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                <div>
                                    <strong class="text-white block font-semibold">Subida (Fase Concêntrica):</strong>
                                    <span id="m3d-mov-concentrico" class="leading-relaxed"></span>
                                </div>
                            </div>
                            <div class="flex items-start gap-2.5">
                                <span class="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                                <div>
                                    <strong class="text-white block font-semibold">Descida (Fase Excêntrica):</strong>
                                    <span id="m3d-mov-excentrico" class="leading-relaxed"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Erros Comuns a Evitar -->
                        <div class="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                            <strong class="text-rose-300 flex items-center gap-1.5 font-bold mb-1">
                                <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
                                Erros Comuns a Evitar:
                            </strong>
                            <p id="m3d-erros" class="text-rose-200/90 leading-relaxed"></p>
                        </div>
                    </div>

                    <!-- Seção de Vídeo Externo Complementar do Personal (Se cadastrado) -->
                    <div id="m3d-video-personal-container" class="hidden bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                <i data-lucide="video" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-white">Vídeo do Personal Trainer</p>
                                <p class="text-[11px] text-slate-400">O treinador disponibilizou uma demonstração extra gravada.</p>
                            </div>
                        </div>
                        <a id="m3d-btn-video-personal" href="#" target="_blank" rel="noopener" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-md shadow-amber-500/20">
                            <i data-lucide="play" class="w-3.5 h-3.5 fill-slate-950"></i>
                            <span>Assistir Vídeo do Personal</span>
                        </a>
                    </div>
                </div>

                <!-- Rodapé com Ações Rápidas -->
                <div class="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
                    <button type="button" id="m3d-btn-timer" onclick="Exercise3D.iniciarTimerRapido(60)" class="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95">
                        <i data-lucide="timer" class="w-4 h-4 text-amber-400"></i>
                        <span>Iniciar Descanso (60s)</span>
                    </button>
                    <button type="button" onclick="Exercise3D.fecharModal()" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer active:scale-95">
                        Entendido / Fechar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fecha ao clicar fora do card
        modal.addEventListener('click', (e) => {
            if (e.target === modal) Exercise3D.fecharModal();
        });

        // Fecha com tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') Exercise3D.fecharModal();
        });

        return modal;
    }

    let isZoomAtivo = false;

    // Objeto Exportado Globalmente
    const Exercise3D = {
        getAnimation(nomeExercicio, grupoMuscular, urlVideoPersonal) {
            return obterExercicio3D(nomeExercicio, grupoMuscular, urlVideoPersonal);
        },

        abrirModal(nomeExercicio, grupoMuscular, urlVideoPersonal) {
            const dados = obterExercicio3D(nomeExercicio, grupoMuscular, urlVideoPersonal);
            const modal = garantirModalExecucao();

            // Preenche dados
            const setTxt = (id, txt) => {
                const el = document.getElementById(id);
                if (el) el.textContent = txt || '';
            };

            setTxt('m3d-titulo', dados.nomeExibicao);
            setTxt('m3d-categoria', dados.categoria || 'Geral');
            setTxt('m3d-equipamento', dados.equipamento || 'Livre');
            setTxt('m3d-alvo-primario', dados.musculoAlvo || 'Grupo Principal');
            setTxt('m3d-musculo-principal', dados.musculoAlvo || 'Peitoral / Bíceps / Costas');
            setTxt('m3d-musculo-secundario', dados.musculosSecundarios || 'Sinergistas de estabilização');
            setTxt('m3d-dica-pro', dados.dicaPro || 'Foque na cadência controlada e respiração fluida.');
            setTxt('m3d-pos-inicial', dados.posicaoInicial || 'Posicione-se firmemente com a coluna ereta e alinhada.');
            setTxt('m3d-mov-concentrico', dados.movimentoConcentrico || 'Execute a contração do músculo alvo sem usar impulso.');
            setTxt('m3d-mov-excentrico', dados.movimentoExcentrico || 'Retorne de forma controlada resistindo ao peso.');
            setTxt('m3d-erros', dados.errosComuns || 'Não utilize impulso com a coluna lombar nem desça o peso rapidamente.');

            // Imagem GIF da execução
            const imgEl = document.getElementById('m3d-animacao-img');
            if (imgEl) {
                imgEl.src = dados.gifUrl;
            }

            // Reset do Zoom
            isZoomAtivo = false;
            const mediaBox = document.getElementById('m3d-media-box');
            if (mediaBox) mediaBox.style.transform = 'scale(1)';

            // Botão de Vídeo do Personal se cadastrado
            const videoBox = document.getElementById('m3d-video-personal-container');
            const videoBtn = document.getElementById('m3d-btn-video-personal');
            if (dados.videoPersonal && dados.videoPersonal.startsWith('http')) {
                if (videoBox) videoBox.classList.remove('hidden');
                if (videoBtn) videoBtn.href = dados.videoPersonal;
            } else {
                if (videoBox) videoBox.classList.add('hidden');
            }

            // Exibe modal com transição
            modal.classList.remove('hidden');
            requestAnimationFrame(() => {
                modal.classList.remove('opacity-0');
                const card = document.getElementById('modal-execucao-card');
                if (card) {
                    card.classList.remove('scale-95');
                    card.classList.add('scale-100');
                }
            });

            // Toca efeito sonoro sutil se disponível no ApexFit
            if (window.soundEngine && typeof window.soundEngine.playSuccess === 'function') {
                window.soundEngine.playSuccess();
            }

            if (window.lucide) lucide.createIcons();
        },

        fecharModal() {
            const modal = document.getElementById('modal-execucao-3d-exercicio');
            if (!modal) return;

            modal.classList.add('opacity-0');
            const card = document.getElementById('modal-execucao-card');
            if (card) {
                card.classList.remove('scale-100');
                card.classList.add('scale-95');
            }

            setTimeout(() => {
                modal.classList.add('hidden');
            }, 250);
        },

        alternarZoom() {
            isZoomAtivo = !isZoomAtivo;
            const mediaBox = document.getElementById('m3d-media-box');
            if (mediaBox) {
                mediaBox.style.transform = isZoomAtivo ? 'scale(1.35)' : 'scale(1)';
            }
        },

        iniciarTimerRapido(segundos = 60) {
            if (window.ApexTimer && typeof window.ApexTimer.mostrar === 'function') {
                window.ApexTimer.mostrar(segundos);
            } else {
                alert(`Descanso de ${segundos}s iniciado!`);
            }
        },

        /**
         * Gera o botão / card interativo para o card de exercício
         */
        renderizarCardBadge(nomeExercicio, grupoMuscular, urlVideoPersonal) {
            const dados = obterExercicio3D(nomeExercicio, grupoMuscular, urlVideoPersonal);
            const thumb = dados.gifUrl || dados.posterUrl;
            const nomeEsc = String(nomeExercicio || '').replace(/'/g, "\\'");
            const grupoEsc = String(grupoMuscular || '').replace(/'/g, "\\'");
            const videoEsc = String(urlVideoPersonal || '').replace(/'/g, "\\'");

            return `
                <div onclick="Exercise3D.abrirModal('${nomeEsc}', '${grupoEsc}', '${videoEsc}')"
                    class="group/btn3d flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/25 hover:border-amber-400/60 shadow-sm transition-all cursor-pointer active:scale-98 select-none">
                    <div class="relative w-12 h-12 rounded-lg bg-slate-950 overflow-hidden border border-slate-800 shrink-0 flex items-center justify-center">
                        <img src="${thumb}" alt="${nomeEsc}" class="w-full h-full object-contain group-hover/btn3d:scale-110 transition-transform duration-300" loading="lazy" />
                        <span class="absolute bottom-0 right-0 bg-red-600 text-white font-black text-[8px] px-1 rounded-tl-md">3D</span>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1">
                            <span class="text-[11px] font-black text-amber-300 group-hover/btn3d:text-amber-200 transition-colors flex items-center gap-1">
                                <i data-lucide="play" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
                                Ver Execução 3D
                            </span>
                        </div>
                        <p class="text-[10px] text-slate-400 truncate mt-0.5">Músculo alvo: <strong class="text-slate-200">${dados.musculoAlvo.split('(')[0].trim()}</strong></p>
                    </div>
                    <div class="w-7 h-7 rounded-lg bg-amber-500/10 group-hover/btn3d:bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <i data-lucide="chevron-right" class="w-3.5 h-3.5 group-hover/btn3d:translate-x-0.5 transition-transform"></i>
                    </div>
                </div>
            `;
        },

        banco: BANCO_EXERCICIOS_3D,

        buscarExercicios(query = '') {
            const termo = (query || '').toLowerCase().trim();
            const resultados = [];
            for (const [chave, dados] of Object.entries(BANCO_EXERCICIOS_3D)) {
                if (!termo || chave.includes(termo) || (dados.nomeFormatado && dados.nomeFormatado.toLowerCase().includes(termo)) || (dados.categoria && dados.categoria.toLowerCase().includes(termo))) {
                    resultados.push({
                        chave,
                        nome: dados.nomeFormatado,
                        categoria: dados.categoria,
                        grupo: dados.categoria,
                        musculoAlvo: dados.musculoAlvo,
                        gifUrl: dados.localGif || dados.cdnGif,
                        tem3D: true
                    });
                }
            }
            return resultados;
        }
    };

    // ==============================================================
    // GESTOR DE PERIODIZAÇÃO & SÉRIES DETALHADAS (ALUNO & PERSONAL)
    // ==============================================================
    const PeriodizacaoManager = {
        obterBadgeTipo(tipo) {
            const t = String(tipo || 'Trabalho').toLowerCase();
            if (t.includes('aquec') || t.includes('warm')) {
                return { label: 'Aquecimento', icone: '🔥', classe: 'bg-orange-500/15 text-orange-300 border-orange-500/30' };
            }
            if (t.includes('feed') || t.includes('prep')) {
                return { label: 'Feeder', icone: '⚡', classe: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
            }
            if (t.includes('drop')) {
                return { label: 'Drop-set', icone: '💥', classe: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30' };
            }
            if (t.includes('falha') || t.includes('fail')) {
                return { label: 'Até a Falha', icone: '💀', classe: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
            }
            return { label: 'Trabalho', icone: '🎯', classe: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
        },

        extrair(exercicio) {
            if (!exercicio) return { obsLimpa: '', series: [] };
            const rawObs = String(exercicio.observacoes || '');
            let series = null;
            let obsLimpa = rawObs;

            const match = rawObs.match(/__PERIODIZACAO__([\s\S]*?)__FIM_PERIODIZACAO__/);
            if (match) {
                try {
                    const parsed = JSON.parse(match[1]);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        series = parsed;
                        obsLimpa = rawObs.replace(/__PERIODIZACAO__[\s\S]*?__FIM_PERIODIZACAO__/, '').trim();
                    }
                } catch (e) {
                    console.warn('Erro ao decodificar periodização JSON:', e);
                }
            }

            if (!series || !series.length) {
                const qtd = parseInt(exercicio.series) || 4;
                const repsStr = String(exercicio.repeticoes || '8-10');
                const repsLista = repsStr.includes('/') ? repsStr.split('/').map(r => r.trim()) : null;
                const cargaBase = exercicio.carga || '60 kg';
                const descansoBase = exercicio.descanso || '60s';

                series = [];
                for (let i = 1; i <= qtd; i++) {
                    let tipo = 'Trabalho';
                    if (i === 1 && qtd >= 4) tipo = 'Aquecimento';
                    else if (i === 2 && qtd >= 5) tipo = 'Feeder';
                    else if (i === qtd && repsStr.toLowerCase().includes('drop')) tipo = 'Drop-set';

                    const reps = (repsLista && repsLista[i - 1]) ? repsLista[i - 1] : repsStr;
                    series.push({
                        id: i,
                        tipo,
                        carga: cargaBase,
                        reps,
                        descanso: descansoBase
                    });
                }
            }

            return { obsLimpa, series };
        },

        serializar(seriesArray, obsTexto = '') {
            const obsPura = String(obsTexto || '').replace(/__PERIODIZACAO__[\s\S]*?__FIM_PERIODIZACAO__/, '').trim();
            if (!seriesArray || !seriesArray.length) return obsPura;
            const tag = `__PERIODIZACAO__${JSON.stringify(seriesArray)}__FIM_PERIODIZACAO__`;
            return obsPura ? `${obsPura}\n${tag}` : tag;
        },

        renderizarTabelaAluno(exercicio, seriesFeitasMap = {}, opcoes = {}) {
            const { obsLimpa, series } = this.extrair(exercicio);
            if (!series || !series.length) return '';

            const exId = String(exercicio.id || '');
            const exNome = String(exercicio.exercicio || 'Exercício');

            const rowsHtml = series.map((s, idx) => {
                const sNum = idx + 1;
                const key = `${exId}_${sNum}`;
                const feita = Boolean(seriesFeitasMap[key]);
                const badge = this.obterBadgeTipo(s.tipo);
                const descansoSeg = parseInt(s.descanso) || 60;
                const cargaFormatada = s.carga ? String(s.carga) : 'Carga livre';

                return `
                    <div class="px-2.5 py-2 sm:px-3 sm:py-2.5 flex items-center justify-between gap-2 transition-colors ${feita ? 'bg-emerald-500/10' : 'hover:bg-slate-800/40'}">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="w-5 h-5 rounded-md ${feita ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-300 border border-slate-700'} flex items-center justify-center text-[10px] font-black shrink-0">
                                ${feita ? '<i data-lucide="check" class="w-3 h-3 text-emerald-400"></i>' : sNum}
                            </span>
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.classe} shrink-0">
                                ${badge.icone} ${s.tipo || 'Trabalho'}
                            </span>
                            <span class="text-xs font-bold text-slate-100 truncate">${cargaFormatada}</span>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                            <span class="text-[11px] font-bold text-amber-300">${String(s.reps)} reps</span>
                            
                            ${s.descanso ? `
                                <button type="button" onclick="if(window.iniciarCronometroDescanso){window.iniciarCronometroDescanso('${s.descanso}')}else if(window.ApexTimer){window.ApexTimer.acionarPorSerie('${s.descanso}')}" 
                                    title="Descanso de ${s.descanso}. Clique para abrir o cronômetro com a contagem regressiva em andamento."
                                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-amber-500/15 border border-slate-700/80 hover:border-amber-500/50 text-[10px] font-bold text-slate-200 hover:text-amber-300 transition-all cursor-pointer active:scale-95 shadow-sm group/btn">
                                    <i data-lucide="timer" class="w-2.5 h-2.5 text-amber-400 group-hover/btn:scale-110 transition-transform"></i>
                                    <span>${s.descanso}</span>
                                </button>
                            ` : ''}

                            ${opcoes.interativo !== false ? `
                                <button type="button" onclick="marcarSerie('${exId}', '${exNome.replace(/'/g, "\\'")}', ${sNum}, '${String(s.descanso || '60s').replace(/'/g, "\\'")}', this)"
                                    data-concluida="${feita ? 'true' : 'false'}"
                                    class="px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer active:scale-95 flex items-center gap-1 ${feita ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20' : 'bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700'}">
                                    ${feita ? '<i data-lucide="check" class="w-3 h-3"></i> Feita' : 'Concluir'}
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            const safeExId = String(exercicio.id || Math.random().toString(36).substr(2, 7)).replace(/[^a-zA-Z0-9_-]/g, '_');
            const corpoId = `periodizacao-corpo-${safeExId}`;
            const chevId = `periodizacao-chev-${safeExId}`;

            return `
                <div class="mt-2.5 rounded-xl border border-slate-800 bg-[#0B0F17]/90 overflow-hidden shadow-inner transition-all">
                    <!-- Cabeçalho Acordeão: Clique para Estender e Retrair a Periodização (Inicia Retraído) -->
                    <div onclick="window.PeriodizacaoManager.alternarColapso('${safeExId}')"
                        role="button"
                        tabindex="0"
                        title="Clique para expandir as metas de cada série"
                        class="px-3 py-2 bg-slate-900/90 hover:bg-slate-800/90 flex items-center justify-between text-[11px] cursor-pointer select-none transition-colors group">
                        <div class="flex items-center gap-1.5 min-w-0">
                            <i data-lucide="table-properties" class="w-3.5 h-3.5 text-amber-400"></i>
                            <span class="font-bold uppercase tracking-wider text-amber-400">Periodização & Metas de Cada Série</span>
                            <span id="periodizacao-hint-${safeExId}" class="text-[9px] text-slate-400 font-medium hidden sm:inline group-hover:text-amber-300/80 transition-colors">
                                (toque para expandir)
                            </span>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                ${series.length} ${series.length === 1 ? 'Série' : 'Séries'}
                            </span>
                            <i data-lucide="chevron-down" id="${chevId}" class="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-transform duration-200"></i>
                        </div>
                    </div>
                    <!-- Corpo Retrátil das Séries (Inicia Retraído) -->
                    <div id="${corpoId}" class="hidden divide-y divide-slate-800/60 transition-all duration-200 border-t border-slate-800">
                        ${rowsHtml}
                    </div>
                </div>
            `;
        },

        alternarColapso(safeExId) {
            const corpo = document.getElementById(`periodizacao-corpo-${safeExId}`);
            const chev = document.getElementById(`periodizacao-chev-${safeExId}`);
            const hint = document.getElementById(`periodizacao-hint-${safeExId}`);
            if (!corpo) return;

            const isHidden = corpo.classList.contains('hidden');
            if (isHidden) {
                corpo.classList.remove('hidden');
                if (chev) chev.classList.add('rotate-180');
                if (hint) hint.textContent = '(toque para retrair)';
            } else {
                corpo.classList.add('hidden');
                if (chev) chev.classList.remove('rotate-180');
                if (hint) hint.textContent = '(toque para expandir)';
            }
        },

        renderizarChipsPeriodizacao(exercicio) {
            const { series } = this.extrair(exercicio);
            if (!series || !series.length) return '';
            return `
                <div class="flex items-center gap-1 flex-wrap mt-1">
                    ${series.map((s, idx) => {
                        const badge = this.obterBadgeTipo(s.tipo);
                        return `
                            <span title="${s.tipo || 'Trabalho'} • ${s.carga || 'Carga livre'} • ${s.reps} reps • desc. ${s.descanso || '60s'}" 
                                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${badge.classe} tracking-tight">
                                <span class="opacity-75">#${idx + 1}</span>
                                <span>${badge.icone}</span>
                                <span>${s.tipo || 'Trabalho'}</span>
                                <span class="text-amber-300 font-extrabold">${s.reps}</span>
                            </span>
                        `;
                    }).join('')}
                </div>
            `;
        }
    };

    Exercise3D.periodizacao = PeriodizacaoManager;
    window.Exercise3D = Exercise3D;
    window.PeriodizacaoManager = PeriodizacaoManager;

})(window);
