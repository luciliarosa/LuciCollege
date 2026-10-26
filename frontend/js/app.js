/* ══════════════════════════════════════════
   LUCI COLLEGE — app.js
   Entrypoint: estado global, dados demo e inicialização
   ══════════════════════════════════════════ */

"use strict";

/* ─── ESTADO GLOBAL DA APLICAÇÃO ─── */
let currentUser   = null;
let currentPoints = 0;

/* ══════════════════════════════════════════
   DADOS DE DEMONSTRAÇÃO (fallback sem API)
   ══════════════════════════════════════════ */

const DEMO_USER = {
  id: 1, nome: "Ana Luíza Ferreira", matricula: "LC2024001",
  curso: "Engenharia de Software", pontos_disponiveis: 3850, pontos_resgatados: 1200, resgates_total: 4,
};

const DEMO_PRODUCTS = [
  { id:1,  nome:"Mochila Luci College",     descricao:'Mochila resistente com logo bordado. Compartimentos para notebook 15", USB embutido.', imagem:"./img/MochilaLuci.png",      categoria:"mochila",   pontos:2500, estoque:8  },
  { id:2,  nome:"Caderno A5 Luci",          descricao:"Caderno capa dura A5, 200 páginas pautadas, com logomarca Luci College.",              imagem:"./img/CadernoLuci.png",      categoria:"papelaria", pontos:600,  estoque:25 },
  { id:3,  nome:"Vale Salgado — Cantina",   descricao:"Um salgado à escolha na cantina central. Válido por 30 dias.",                         imagem:"./img/ValeCantinaLuci.png",  categoria:"servico",   pontos:200,  estoque:99 },
  { id:4,  nome:"Kit Canetas (6un)",        descricao:"Kit com 6 canetas esferográficas azuis, pretas e vermelhas com logo Luci.",            imagem:"./img/KitCanetaLuci.png",    categoria:"papelaria", pontos:300,  estoque:40 },
  { id:5,  nome:"Chaveiro Metálico Luci",   descricao:"Chaveiro em metal com acabamento fosco e gravação do brasão Luci College.",            imagem:"./img/ChaveiroLuci.png",     categoria:"acessorio", pontos:150,  estoque:60 },
  { id:6,  nome:"Estojo Tech Luci",         descricao:"Estojo rígido com zíper duplo, porta estilete, porta USB e espaço para cabos.",        imagem:"./img/EstojoLuci.png",       categoria:"papelaria", pontos:900,  estoque:15 },
  { id:7,  nome:"Garrafa Térmica 500ml",    descricao:"Garrafa inox 500ml, mantém temperatura por até 12h. Logo Luci em relevo.",             imagem:"./img/GarrafaLuci.png",      categoria:"acessorio", pontos:1200, estoque:10 },
  { id:8,  nome:"Vale Almoço — Rest. U.",   descricao:"Almoço completo no Restaurante Universitário. Prato, salada e sobremesa.",             imagem:"./img/ValeAlmocoLuci.png",   categoria:"servico",   pontos:450,  estoque:30 },
  { id:9,  nome:"Caneca Luci Tech",         descricao:"Caneca de porcelana 350ml com design exclusivo da turma de Tecnologia.",               imagem:"./img/CanecaLuci.png",       categoria:"acessorio", pontos:500,  estoque:20 },
  { id:10, nome:"Impressão A4 — 50 folhas", descricao:"Crédito de 50 impressões A4 P&B nas impressoras do campus. Expira em 60 dias.",       imagem:"./img/ImpressaoLuci.png",    categoria:"servico",   pontos:350,  estoque:99 },
  { id:11, nome:"Mochila Slim Luci Pro",    descricao:"Versão slim premium com sistema anti-roubo e alças acolchoadas ergonômicas.",          imagem:"./img/MochilaSlimLuci.png",  categoria:"mochila",   pontos:3500, estoque:4  },
  { id:12, nome:"Agenda 2026 Luci",         descricao:"Agenda semanal capa dura 2026 com calendário acadêmico e datas de avaliações.",        imagem:"./img/AgendaLuci.png",       categoria:"papelaria", pontos:750,  estoque:18 },
];

const DEMO_HISTORY = [
  { data:"15/05/2026", premio:"Estojo Tech Luci",       imagem:"./img/EstojoLuci.png",      categoria:"papelaria", pontos:900, status:"aprovado"  },
  { data:"02/04/2026", premio:"Kit Canetas (6un)",       imagem:"./img/KitCanetaLuci.png",   categoria:"papelaria", pontos:300, status:"aprovado"  },
  { data:"10/03/2026", premio:"Vale Salgado — Cantina", imagem:"./img/ValeCantinaLuci.png", categoria:"servico",   pontos:200, status:"pendente"  },
  { data:"21/01/2026", premio:"Caderno A5 Luci",        imagem:"./img/CadernoLuci.png",     categoria:"papelaria", pontos:600, status:"aprovado"  },
  { data:"05/12/2025", premio:"Chaveiro Metálico Luci", imagem:"./img/ChaveiroLuci.png",    categoria:"acessorio", pontos:150, status:"entregue"  },
  { data:"18/11/2025", premio:"Vale Almoço — Rest. U.", imagem:"./img/ValeAlmocoLuci.png",  categoria:"servico",   pontos:450, status:"cancelado" },
];

const DEMO_RANKING = [
  { nome:"Carlos Eduardo Silva",  iniciais:"CE", curso:"Ciência da Computação",  pontos:6420, me:false },
  { nome:"Mariana Souza Faria",   iniciais:"MS", curso:"Engenharia de Software", pontos:5890, me:false },
  { nome:"Rafael Lima Andrade",   iniciais:"RL", curso:"Análise e Sistemas",     pontos:5210, me:false },
  { nome:"Ana Luíza Ferreira",    iniciais:"AL", curso:"Engenharia de Software", pontos:5050, me:true  },
  { nome:"Juliana Pires Mello",   iniciais:"JP", curso:"Redes de Computadores",  pontos:4700, me:false },
  { nome:"Bruno Carvalho Rocha",  iniciais:"BC", curso:"Cybersecurity",          pontos:4300, me:false },
  { nome:"Letícia Alves Santos",  iniciais:"LA", curso:"Ciência da Computação",  pontos:3990, me:false },
  { nome:"Pedro Henrique Gomes",  iniciais:"PH", curso:"Análise e Sistemas",     pontos:3760, me:false },
  { nome:"Fernanda Castro Lima",  iniciais:"FC", curso:"Engenharia de Software", pontos:3520, me:false },
  { nome:"Diego Mendes Rocha",    iniciais:"DM", curso:"Ciência da Computação",  pontos:3100, me:false },
  { nome:"Camila Torres Nunes",   iniciais:"CT", curso:"Análise e Sistemas",     pontos:2980, me:false },
  { nome:"Lucas Ribeiro Viana",   iniciais:"LR", curso:"Cybersecurity",          pontos:2750, me:false },
];

const DEMO_TEACHERS = [
  { id:101, matricula:"PROF101", nome:"Prof. Roberto Mendes",  email:"roberto.mendes@lucicollege.edu.br", role:"professor", departamento:"Ciência da Computação & BD",          materias:["ALGO101","BD201"]   },
  { id:102, matricula:"PROF102", nome:"Profa. Camila Torres",  email:"camila.torres@lucicollege.edu.br",  role:"professor", departamento:"Engenharia de Software & Segurança",   materias:["ENG301","SEC401"]   },
];

const DEMO_ADMIN = {
  id:999, matricula:"admin", nome:"Coordenação Acadêmica Geral", email:"admin@lucicollege.edu.br",
  role:"admin", departamento:"Diretoria e Coordenação Acadêmica", materias:["ALGO101","BD201","ENG301","SEC401"],
};

const DEMO_SUBJECTS = {
  "ALGO101": {
    id:"ALGO101", nome:"Algoritmos e Estruturas de Dados", curso:"Engenharia & Ciência da Computação",
    semestre:"2026/1", professorId:"PROF101", professorNome:"Prof. Roberto Mendes", totalAulas:40,
    trabalhos:[
      { id:"T1", titulo:"Implementação de Árvore AVL e B-Tree",         peso:3, prazo:"18/04/2026" },
      { id:"T2", titulo:"Algoritmos de Menor Caminho (Dijkstra)",        peso:4, prazo:"25/05/2026" },
    ],
    alunos:[
      { matricula:"LC2024001", nome:"Ana Luíza Ferreira",   curso:"Engenharia de Software",   p1:9.0, p2:8.5, trab:9.5, faltas:2, presencas:38, entregas:{ T1:{status:"avaliado",nota:9.5}, T2:{status:"entregue",nota:null} } },
      { matricula:"LC2024002", nome:"Carlos Eduardo Silva",  curso:"Ciência da Computação",    p1:9.5, p2:10.0,trab:9.0, faltas:1, presencas:39, entregas:{ T1:{status:"avaliado",nota:9.0}, T2:{status:"avaliado",nota:9.8} } },
      { matricula:"LC2024003", nome:"Mariana Souza Faria",   curso:"Engenharia de Software",   p1:7.5, p2:8.0, trab:8.5, faltas:4, presencas:36, entregas:{ T1:{status:"avaliado",nota:8.5}, T2:{status:"pendente",nota:null} } },
      { matricula:"LC2024004", nome:"Rafael Lima Andrade",   curso:"Análise e Sistemas",       p1:6.0, p2:5.5, trab:7.0, faltas:6, presencas:34, entregas:{ T1:{status:"avaliado",nota:7.0}, T2:{status:"pendente",nota:null} } },
    ],
  },
  "BD201": {
    id:"BD201", nome:"Banco de Dados Relacional & SQL", curso:"Tecnologia da Informação & Redes",
    semestre:"2026/1", professorId:"PROF101", professorNome:"Prof. Roberto Mendes", totalAulas:36,
    trabalhos:[
      { id:"T1", titulo:"Modelagem de Dados e DER de E-commerce",         peso:4, prazo:"10/04/2026" },
      { id:"T2", titulo:"Otimização de Queries, Índices e Tuning",         peso:6, prazo:"30/05/2026" },
    ],
    alunos:[
      { matricula:"LC2024001", nome:"Ana Luíza Ferreira",   curso:"Engenharia de Software",   p1:8.5, p2:9.0, trab:9.0, faltas:1, presencas:35, entregas:{ T1:{status:"avaliado",nota:9.0}, T2:{status:"entregue",nota:null} } },
      { matricula:"LC2024005", nome:"Juliana Pires Mello",   curso:"Redes de Computadores",    p1:8.0, p2:7.5, trab:8.0, faltas:3, presencas:33, entregas:{ T1:{status:"avaliado",nota:8.0}, T2:{status:"avaliado",nota:8.5} } },
      { matricula:"LC2024006", nome:"Bruno Carvalho Rocha",  curso:"Cybersecurity",            p1:7.0, p2:8.0, trab:7.5, faltas:5, presencas:31, entregas:{ T1:{status:"avaliado",nota:7.5}, T2:{status:"pendente",nota:null} } },
      { matricula:"LC2024007", nome:"Letícia Alves Santos",  curso:"Ciência da Computação",    p1:9.0, p2:9.5, trab:9.5, faltas:0, presencas:36, entregas:{ T1:{status:"avaliado",nota:9.5}, T2:{status:"avaliado",nota:9.5} } },
    ],
  },
  "ENG301": {
    id:"ENG301", nome:"Engenharia de Software & DevOps", curso:"Engenharia de Software",
    semestre:"2026/1", professorId:"PROF102", professorNome:"Profa. Camila Torres", totalAulas:38,
    trabalhos:[{ id:"T1", titulo:"Pipeline CI/CD com Testes e Deploy Contínuo", peso:5, prazo:"22/04/2026" }],
    alunos:[
      { matricula:"LC2024003", nome:"Mariana Souza Faria",  curso:"Engenharia de Software", p1:9.0, p2:9.0, trab:9.5, faltas:2, presencas:36, entregas:{ T1:{status:"avaliado",nota:9.5} } },
      { matricula:"LC2024006", nome:"Bruno Carvalho Rocha", curso:"Cybersecurity",          p1:8.0, p2:8.5, trab:8.0, faltas:3, presencas:35, entregas:{ T1:{status:"avaliado",nota:8.0} } },
      { matricula:"LC2024008", nome:"Pedro Henrique Gomes", curso:"Análise e Sistemas",     p1:7.0, p2:6.5, trab:7.0, faltas:4, presencas:34, entregas:{ T1:{status:"avaliado",nota:7.0} } },
    ],
  },
  "SEC401": {
    id:"SEC401", nome:"Segurança de Redes e Criptografia", curso:"Cybersecurity",
    semestre:"2026/1", professorId:"PROF102", professorNome:"Profa. Camila Torres", totalAulas:32,
    trabalhos:[{ id:"T1", titulo:"Análise de Vulnerabilidade e Pentest Prático", peso:5, prazo:"05/05/2026" }],
    alunos:[
      { matricula:"LC2024005", nome:"Juliana Pires Mello",  curso:"Redes de Computadores", p1:8.5, p2:8.5, trab:9.0,  faltas:1, presencas:31, entregas:{ T1:{status:"avaliado",nota:9.0}  } },
      { matricula:"LC2024006", nome:"Bruno Carvalho Rocha", curso:"Cybersecurity",          p1:9.5, p2:9.0, trab:10.0, faltas:0, presencas:32, entregas:{ T1:{status:"avaliado",nota:10.0} } },
      { matricula:"LC2024007", nome:"Letícia Alves Santos", curso:"Ciência da Computação",  p1:8.0, p2:8.0, trab:8.5,  faltas:2, presencas:30, entregas:{ T1:{status:"avaliado",nota:8.5}  } },
    ],
  },
};

const DEMO_ATIVIDADES = {
  "2026-1": [
    { data:"20/05/2026", tipo:"presenca",  descricao:"Aula — Eng. de Software IV",  status:"ganhou",     pontos:100, detalhe:"Frequência: 80%"            },
    { data:"19/05/2026", tipo:"prova",     descricao:"Prova P2 — Banco de Dados",   status:"ganhou",     pontos:420, detalhe:"Nota: 8,4"                   },
    { data:"17/05/2026", tipo:"presenca",  descricao:"Aula — Redes e Protocolos",   status:"nao_ganhou", pontos:0,   detalhe:"Frequência: 60%",  motivo_nao:"Frequência abaixo de 75%" },
    { data:"14/05/2026", tipo:"trabalho",  descricao:"TDE — UX e Prototipagem",     status:"ganhou",     pontos:100, detalhe:"Entregue no prazo"            },
    { data:"12/05/2026", tipo:"presenca",  descricao:"Aula — Cálculo Numérico",     status:"ganhou",     pontos:100, detalhe:"Frequência: 100%"             },
    { data:"08/05/2026", tipo:"evento",    descricao:"Semana da Computação 2026",   status:"ganhou",     pontos:500, detalhe:"Participação completa"        },
    { data:"28/04/2026", tipo:"presenca",  descricao:"Aula — Eng. de Software IV",  status:"ganhou",     pontos:100, detalhe:"Frequência: 90%"              },
    { data:"25/04/2026", tipo:"prova",     descricao:"Prova P1 — Compiladores",     status:"nao_ganhou", pontos:0,   detalhe:"Nota: 3,5",        motivo_nao:"Nota abaixo do mínimo (5,0)" },
    { data:"22/04/2026", tipo:"trabalho",  descricao:"TDE — Análise de Algoritmos", status:"ganhou",     pontos:100, detalhe:"Entregue no prazo"            },
    { data:"18/04/2026", tipo:"presenca",  descricao:"Aula — Banco de Dados II",    status:"ganhou",     pontos:100, detalhe:"Frequência: 85%"              },
    { data:"10/04/2026", tipo:"prova",     descricao:"Prova P1 — Banco de Dados",   status:"ganhou",     pontos:380, detalhe:"Nota: 7,6"                   },
    { data:"05/04/2026", tipo:"indicacao", descricao:"Indicação de colega",         status:"ganhou",     pontos:300, detalhe:"Lucas Ribeiro matriculado"    },
    { data:"28/03/2026", tipo:"trabalho",  descricao:"TDE — Estruturas de Dados",   status:"nao_ganhou", pontos:0,   detalhe:"Entregue com atraso", motivo_nao:"Entrega fora do prazo" },
    { data:"24/03/2026", tipo:"presenca",  descricao:"Aula — Compiladores",         status:"ganhou",     pontos:100, detalhe:"Frequência: 75%"              },
    { data:"20/03/2026", tipo:"presenca",  descricao:"Aula — Cálculo Numérico",     status:"nao_ganhou", pontos:0,   detalhe:"Frequência: 50%",  motivo_nao:"Frequência abaixo de 75%" },
    { data:"15/03/2026", tipo:"evento",    descricao:"Hackathon Luci 2026",         status:"ganhou",     pontos:800, detalhe:"3º lugar na competição"       },
    { data:"10/03/2026", tipo:"prova",     descricao:"Prova P1 — Compiladores",     status:"ganhou",     pontos:460, detalhe:"Nota: 9,2"                   },
    { data:"05/03/2026", tipo:"presenca",  descricao:"Aula — Redes e Protocolos",   status:"ganhou",     pontos:100, detalhe:"Frequência: 80%"              },
    { data:"27/02/2026", tipo:"presenca",  descricao:"Aula — Eng. de Software IV",  status:"ganhou",     pontos:100, detalhe:"Frequência: 100%"             },
    { data:"20/02/2026", tipo:"trabalho",  descricao:"TDE — Requisitos de Software",status:"ganhou",     pontos:100, detalhe:"Entregue no prazo"            },
    { data:"13/02/2026", tipo:"presenca",  descricao:"Aula — Banco de Dados II",    status:"nao_ganhou", pontos:0,   detalhe:"Faltou",            motivo_nao:"Frequência abaixo de 75%" },
    { data:"06/02/2026", tipo:"evento",    descricao:"Palestra — IA na Indústria",  status:"ganhou",     pontos:200, detalhe:"Presença confirmada"          },
  ],
  "2025-2": [
    { data:"10/12/2025", tipo:"prova",     descricao:"Prova Final — Álgebra Linear",   status:"ganhou",     pontos:490, detalhe:"Nota: 9,8"         },
    { data:"05/12/2025", tipo:"trabalho",  descricao:"TDE — Projeto Final Eng. SW",    status:"ganhou",     pontos:100, detalhe:"Entregue no prazo" },
    { data:"28/11/2025", tipo:"presenca",  descricao:"Aula — Álgebra Linear",          status:"ganhou",     pontos:100, detalhe:"Frequência: 90%"   },
    { data:"20/11/2025", tipo:"evento",    descricao:"ENCOINFO 2024",                  status:"ganhou",     pontos:400, detalhe:"Participação completa" },
    { data:"15/11/2025", tipo:"prova",     descricao:"Prova P2 — Eng. de Software",    status:"nao_ganhou", pontos:0,   detalhe:"Nota: 4,0", motivo_nao:"Nota abaixo do mínimo (5,0)" },
    { data:"08/11/2025", tipo:"presenca",  descricao:"Aula — POO Avançada",            status:"ganhou",     pontos:100, detalhe:"Frequência: 85%"   },
    { data:"25/10/2025", tipo:"prova",     descricao:"Prova P2 — Álgebra Linear",      status:"ganhou",     pontos:350, detalhe:"Nota: 7,0"         },
    { data:"18/10/2025", tipo:"trabalho",  descricao:"TDE — Design Patterns",          status:"nao_ganhou", pontos:0,   detalhe:"Não entregue", motivo_nao:"Trabalho não entregue" },
    { data:"10/10/2025", tipo:"presenca",  descricao:"Aula — Álgebra Linear",          status:"ganhou",     pontos:100, detalhe:"Frequência: 80%"   },
    { data:"02/10/2025", tipo:"indicacao", descricao:"Indicação de colega",            status:"ganhou",     pontos:300, detalhe:"Pedro Gomes matriculado" },
  ],
  "2025-1": [
    { data:"15/06/2025", tipo:"prova",     descricao:"Prova Final — Cálculo I",      status:"ganhou",     pontos:440, detalhe:"Nota: 8,8"         },
    { data:"10/06/2025", tipo:"trabalho",  descricao:"TDE — Modelagem de Dados",     status:"ganhou",     pontos:100, detalhe:"Entregue no prazo" },
    { data:"05/06/2025", tipo:"presenca",  descricao:"Aula — Programação Web",       status:"ganhou",     pontos:100, detalhe:"Frequência: 100%"  },
    { data:"20/05/2025", tipo:"prova",     descricao:"Prova P2 — Cálculo I",         status:"nao_ganhou", pontos:0,   detalhe:"Nota: 4,5", motivo_nao:"Nota abaixo do mínimo (5,0)" },
    { data:"15/05/2025", tipo:"evento",    descricao:"Semana da TI 2024",            status:"ganhou",     pontos:300, detalhe:"Participação completa" },
    { data:"10/04/2025", tipo:"prova",     descricao:"Prova P1 — Cálculo I",         status:"ganhou",     pontos:500, detalhe:"Nota: 10,0"        },
    { data:"05/04/2025", tipo:"presenca",  descricao:"Aula — Algoritmos",            status:"nao_ganhou", pontos:0,   detalhe:"Frequência: 40%", motivo_nao:"Frequência abaixo de 75%" },
    { data:"20/03/2025", tipo:"trabalho",  descricao:"TDE — Lógica de Programação",  status:"ganhou",     pontos:100, detalhe:"Entregue no prazo" },
    { data:"10/03/2025", tipo:"presenca",  descricao:"Aula — Cálculo I",             status:"ganhou",     pontos:100, detalhe:"Frequência: 75%"   },
    { data:"01/03/2025", tipo:"evento",    descricao:"Aula Inaugural 2024/1",        status:"ganhou",     pontos:200, detalhe:"Presença confirmada" },
  ],
};

const STUDENT_PROFILES = {
  "LC2024001": { matricula:"LC2024001", nome:"Ana Luíza Ferreira",   curso:"Engenharia de Software", semestre:"4º Semestre", email:"ana.ferreira@luci.edu.br",    pontos_disponiveis:3850, pontos_resgatados:1200,
    historico_pontos:[
      { data:"20/05/2026", tipo:"credito", motivo:"Nota 8,4 na Prova P2 de Banco de Dados",             origem:"Prof. Roberto Mendes",    pontos:420  },
      { data:"14/05/2026", tipo:"credito", motivo:"TDE UX e Prototipagem entregue no prazo",            origem:"Profa. Camila Torres",    pontos:100  },
      { data:"08/05/2026", tipo:"credito", motivo:"Participação completa na Semana da Computação",      origem:"Coordenação Acadêmica",   pontos:500  },
      { data:"02/04/2026", tipo:"debito",  motivo:"Resgate de Prêmio: Kit Canetas (6un)",               origem:"Catálogo Luci College",   pontos:-300 },
      { data:"15/03/2026", tipo:"credito", motivo:"3º Lugar no Hackathon Luci College 2026",            origem:"Prof. Roberto Mendes",    pontos:800  },
      { data:"21/01/2026", tipo:"debito",  motivo:"Resgate de Prêmio: Caderno A5 Luci",                 origem:"Catálogo Luci College",   pontos:-600 },
      { data:"10/01/2026", tipo:"credito", motivo:"Créditos por Iniciação Científica e Desempenho",     origem:"Coordenação Acadêmica",   pontos:3230 },
    ]},
  "LC2024002": { matricula:"LC2024002", nome:"Carlos Eduardo Silva",  curso:"Ciência da Computação",    semestre:"5º Semestre", email:"carlos.silva@luci.edu.br",    pontos_disponiveis:6420, pontos_resgatados:2500,
    historico_pontos:[
      { data:"18/05/2026", tipo:"credito", motivo:"Melhor nota da turma na P2 de Algoritmos (10.0)",    origem:"Prof. Roberto Mendes",    pontos:300   },
      { data:"25/04/2026", tipo:"credito", motivo:"Monitoria voluntária de Programação para calouros",  origem:"Prof. Roberto Mendes",    pontos:250   },
      { data:"15/03/2026", tipo:"credito", motivo:"1º Lugar no Hackathon Luci College 2026",            origem:"Coordenação Acadêmica",   pontos:1000  },
      { data:"10/02/2026", tipo:"debito",  motivo:"Resgate de Prêmio: Mochila Luci College",            origem:"Catálogo Luci College",   pontos:-2500 },
      { data:"15/01/2026", tipo:"credito", motivo:"Bônus por Coeficiente de Rendimento Acadêmico Alto", origem:"Coordenação Acadêmica",   pontos:7370  },
    ]},
  "LC2024003": { matricula:"LC2024003", nome:"Mariana Souza Faria",   curso:"Engenharia de Software",   semestre:"4º Semestre", email:"mariana.faria@luci.edu.br",   pontos_disponiveis:5890, pontos_resgatados:1100,
    historico_pontos:[
      { data:"12/05/2026", tipo:"credito", motivo:"Projeto de DevOps e CI/CD avaliado com Nota 9.5",    origem:"Profa. Camila Torres",    pontos:200   },
      { data:"20/04/2026", tipo:"credito", motivo:"Excelente participação nos seminários de Engenharia", origem:"Profa. Camila Torres",   pontos:150   },
      { data:"10/03/2026", tipo:"debito",  motivo:"Resgate de Prêmio: Vale Almoço — Rest. U.",          origem:"Catálogo Luci College",   pontos:-450  },
      { data:"15/01/2026", tipo:"credito", motivo:"Pontos acadêmicos acumulados no semestre anterior",  origem:"Coordenação Acadêmica",   pontos:5990  },
    ]},
  "LC2024004": { matricula:"LC2024004", nome:"Rafael Lima Andrade",   curso:"Análise e Sistemas",       semestre:"3º Semestre", email:"rafael.andrade@luci.edu.br",  pontos_disponiveis:5210, pontos_resgatados:600,
    historico_pontos:[
      { data:"10/05/2026", tipo:"credito", motivo:"Entrega antecipada do trabalho prático de Algoritmos",origem:"Prof. Roberto Mendes",   pontos:200   },
      { data:"22/03/2026", tipo:"credito", motivo:"Apoio voluntário na organização do Tech Day",        origem:"Coordenação Acadêmica",   pontos:350   },
      { data:"20/02/2026", tipo:"debito",  motivo:"Resgate de Prêmio: Caderno A5 Luci",                 origem:"Catálogo Luci College",   pontos:-600  },
      { data:"15/01/2026", tipo:"credito", motivo:"Créditos por participação em oficinas extracurriculares",origem:"Coordenação Acadêmica",pontos:5260 },
    ]},
  "LC2024005": { matricula:"LC2024005", nome:"Juliana Pires Mello",   curso:"Redes de Computadores",    semestre:"3º Semestre", email:"juliana.mello@luci.edu.br",   pontos_disponiveis:4700, pontos_resgatados:900,
    historico_pontos:[
      { data:"15/05/2026", tipo:"credito", motivo:"Configuração de topologia de redes no laboratório Nota 10",origem:"Profa. Camila Torres",pontos:250 },
      { data:"10/04/2026", tipo:"debito",  motivo:"Resgate de Prêmio: Caneca Luci Tech",                origem:"Catálogo Luci College",   pontos:-500  },
      { data:"18/02/2026", tipo:"credito", motivo:"Nota 8.0 na prova de Banco de Dados",                origem:"Prof. Roberto Mendes",    pontos:200   },
      { data:"15/01/2026", tipo:"credito", motivo:"Pontos acumulados em atividades complementares",      origem:"Coordenação Acadêmica",   pontos:4750  },
    ]},
  "LC2024006": { matricula:"LC2024006", nome:"Bruno Carvalho Rocha",  curso:"Cybersecurity",            semestre:"4º Semestre", email:"bruno.rocha@luci.edu.br",     pontos_disponiveis:4300, pontos_resgatados:700,
    historico_pontos:[
      { data:"18/05/2026", tipo:"credito", motivo:"Desafio prático de Pentest e Criptografia Nota Máxima",origem:"Profa. Camila Torres", pontos:300   },
      { data:"05/04/2026", tipo:"credito", motivo:"2º Lugar no Desafio CTF (Capture the Flag)",         origem:"Profa. Camila Torres",    pontos:200   },
      { data:"12/03/2026", tipo:"debito",  motivo:"Resgate de Prêmio: Vale Cantina e Café",             origem:"Catálogo Luci College",   pontos:-200  },
      { data:"15/01/2026", tipo:"credito", motivo:"Pontuação inicial de matrícula e aproveitamento",    origem:"Coordenação Acadêmica",   pontos:4000  },
    ]},
  "LC2024007": { matricula:"LC2024007", nome:"Letícia Alves Santos",  curso:"Ciência da Computação",    semestre:"4º Semestre", email:"leticia.santos@luci.edu.br",  pontos_disponiveis:3990, pontos_resgatados:500,
    historico_pontos:[
      { data:"19/05/2026", tipo:"credito", motivo:"Nota 9.5 na Prova P2 de Banco de Dados",             origem:"Prof. Roberto Mendes",    pontos:200   },
      { data:"14/04/2026", tipo:"credito", motivo:"Artigo científico aceito para o simpósio do campus", origem:"Prof. Roberto Mendes",    pontos:350   },
      { data:"10/02/2026", tipo:"debito",  motivo:"Resgate de Prêmio: Caneca Luci Tech",                origem:"Catálogo Luci College",   pontos:-500  },
      { data:"15/01/2026", tipo:"credito", motivo:"Pontos acadêmicos por iniciação científica",         origem:"Coordenação Acadêmica",   pontos:3940  },
    ]},
  "LC2024008": { matricula:"LC2024008", nome:"Pedro Henrique Gomes",  curso:"Análise e Sistemas",       semestre:"2º Semestre", email:"pedro.gomes@luci.edu.br",     pontos_disponiveis:3760, pontos_resgatados:400,
    historico_pontos:[
      { data:"16/05/2026", tipo:"credito", motivo:"Participação ativa e presença 100% nas aulas de DevOps",origem:"Profa. Camila Torres", pontos:150  },
      { data:"20/04/2026", tipo:"debito",  motivo:"Resgate de Prêmio: Chaveiro Metálico Luci",          origem:"Catálogo Luci College",   pontos:-150  },
      { data:"15/01/2026", tipo:"credito", motivo:"Pontos de incentivo acadêmico do 1º ano",            origem:"Coordenação Acadêmica",   pontos:3760  },
    ]},
};

/* ══════════════════════════════════════════
   INICIALIZAÇÃO DO APP DO ALUNO
   ══════════════════════════════════════════ */

/** Inicializa o app do aluno após login bem-sucedido. */
async function enterApp() {
  const publicNav = document.getElementById("public-navbar");
  if (publicNav) publicNav.classList.add("hidden");
  document.getElementById("login-overlay").classList.remove("active");
  document.getElementById("login-overlay").classList.add("hidden");
  document.getElementById("admin-app").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  updateUI();
  await loadProducts();
  await loadHistory();
  await loadRanking();
  initNav();
}

/** Atualiza todos os elementos de UI com os dados do usuário logado. */
function updateUI() {
  const nome = currentUser.nome.split(" ")[0];
  const pct  = Math.min(100, Math.round((currentUser.pontos_disponiveis / 5000) * 100));
  setEl("hero-greeting",   `Olá, ${nome}!`);
  setEl("pts-disponiveis", formatNum(currentUser.pontos_disponiveis));
  setEl("pts-resgatados",  formatNum(currentUser.pontos_resgatados));
  setEl("resgates-total",  currentUser.resgates_total);
  setEl("header-pts",      formatNum(currentUser.pontos_disponiveis));
  setEl("pts-nivel-label", getLevel(currentUser.pontos_disponiveis));
  setTimeout(() => { document.getElementById("pts-bar").style.width = pct + "%"; }, 300);
}

/* ══════════════════════════════════════════
   NAVEGAÇÃO ENTRE SEÇÕES
   ══════════════════════════════════════════ */

/** Inicializa os listeners de navegação do header. */
function initNav() {
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      showSection(link.dataset.section);
    });
  });
}

/**
 * Exibe a seção especificada e oculta as demais.
 * @param {"catalogo"|"historico"|"ranking"|"perfil"} sec
 */
function showSection(sec) {
  const catalogHeader = document.querySelector(".catalog-header");
  const hero          = document.querySelector(".hero");
  const productsGrid  = document.getElementById("products-grid");

  productsGrid.style.display  = sec === "catalogo" ? "grid"  : "none";
  catalogHeader.style.display = sec === "catalogo" ? "block" : "none";
  hero.style.display          = sec === "catalogo" ? "flex"  : "none";

  _toggleSection("historico", sec === "historico");
  _toggleSection("ranking",   sec === "ranking");
  _toggleSection("perfil",    sec === "perfil");

  if (sec === "perfil") renderPerfil();
}

/**
 * Mostra ou oculta uma seção pelo ID.
 * @param {string} id
 * @param {boolean} show
 */
function _toggleSection(id, show) {
  const el = document.getElementById(id);
  show ? el.classList.remove("hidden") : el.classList.add("hidden");
}

/* ══════════════════════════════════════════
   MODAIS INFORMATIVOS (Regulamento, Suporte, Secretaria)
   ══════════════════════════════════════════ */

function openRegulamento() {
  document.getElementById("modal-regulamento").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeRegulamento(e) {
  if (e && e.target !== document.getElementById("modal-regulamento")) return;
  document.getElementById("modal-regulamento").classList.add("hidden");
  document.body.style.overflow = "";
}

function openSuporteModal() {
  document.getElementById("modal-suporte").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeSuporteModal(e) {
  if (e && e.target !== document.getElementById("modal-suporte")) return;
  document.getElementById("modal-suporte").classList.add("hidden");
  document.body.style.overflow = "";
}

function openSecretariaModal() {
  document.getElementById("modal-secretaria").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeSecretariaModal(e) {
  if (e && e.target !== document.getElementById("modal-secretaria")) return;
  document.getElementById("modal-secretaria").classList.add("hidden");
  document.body.style.overflow = "";
}


function openPrivacidadeModal() {
  const modal = document.getElementById("modal-privacidade");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

function closePrivacidadeModal(e) {
  const modal = document.getElementById("modal-privacidade");
  if (e && e.target !== modal) return;
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}