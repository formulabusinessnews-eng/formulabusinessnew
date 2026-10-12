import { 
  MagazineIssue, 
  NewsItem, 
  Category, 
  VideoItem, 
  BreakingNewsTickerItem, 
  AdPlan, 
  AdCampaign, 
  Coupon, 
  AffiliateSeller, 
  CommissionRecord, 
  SiteSettings, 
  EventItem,
  FormulaDaBelezaProgram
} from '../types';

export const initialSiteSettings: SiteSettings = {
  portalName: 'Portal Fórmula Business News',
  tagline: 'O mais influente portal de negócios, inovação, mercado e revista digital',
  logoUrl: '/assets/logo/logo-principal.png',
  faviconUrl: '',
  contactEmail: 'comercial@formulabusiness.com.br',
  contactPhone: '+55 (11) 3280-9000',
  contactWhatsapp: '+55 (11) 98877-6655',
  primaryColor: '#020B14',
  goldColor: '#D9A928',
  isLive: true,
  liveTitle: 'AO VIVO: Fórum Global de Líderes Empresariais 2026 — Transmissão Oficial',
  liveStreamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  youtubeUrl: 'https://youtube.com',
  linkedinUrl: 'https://linkedin.com',
  googleAnalyticsId: 'G-FBN2026DEMO',
  metaPixelId: 'PIXEL-FBN-883'
};

export const initialCategories: Category[] = [
  { id: '1', name: 'Business', slug: 'business', color: '#D9A928' },
  { id: '2', name: 'Empreendedorismo', slug: 'empreendedorismo', color: '#38BDF8' },
  { id: '3', name: 'Beleza & Estética', slug: 'beleza-estetica', color: '#F43F5E' },
  { id: '4', name: 'Tecnologia & Inovação', slug: 'tecnologia-inovacao', color: '#818CF8' },
  { id: '5', name: 'Saúde & Bem-estar', slug: 'saude-bem-estar', color: '#34D399' },
  { id: '6', name: 'Carreira & Profissões', slug: 'carreira-profissoes', color: '#FBBF24' },
  { id: '7', name: 'Economia', slug: 'economia', color: '#10B981' },
  { id: '8', name: 'Cultura', slug: 'cultura', color: '#C084FC' },
  { id: '9', name: 'Eventos', slug: 'eventos', color: '#FB923C' }
];

export const initialTickerItems: BreakingNewsTickerItem[] = [
  {
    id: 'ticker-1',
    text: 'URGENTE | Fórmula Business News premia os 50 maiores líderes de inovação e tecnologia do ano em São Paulo',
    priority: 'HIGH',
    active: true,
    link: '#noticias'
  },
  {
    id: 'ticker-2',
    text: 'MERCADO | Volume de investimentos em startups brasileiras cresce 34% no primeiro trimestre com foco em inteligência artificial',
    priority: 'HIGH',
    active: true,
    link: '#noticias'
  },
  {
    id: 'ticker-3',
    text: 'REVISTA DIGITAL | Nova Edição Especial nº 42 disponível com análise exclusiva do cenário macroeconômico global',
    priority: 'NORMAL',
    active: true,
    link: '#revista'
  }
];

export const initialNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Transformação Digital Acelerada: Como Grandes Corporações Estão Reestruturando Seus Modelos de Receita',
    slug: 'transformacao-digital-acelerada-grandes-corporacoes',
    excerpt: 'Líderes de inovação revelam estratégias práticas de adoção de inteligência artificial generativa e hiperautomação para ampliar a margem operacional.',
    content: `A revolução dos modelos de negócio corporativos entrou em um estágio decisivo. Companhias que até recentemente tratavam a inteligência artificial como laboratório experimental agora a colocam no centro da geração de receitas.\n\nSegundo dados consolidados pela consultoria global McKinsey, a taxa de retorno sobre projetos de automação estratégica superou os 42% no último exercício fiscal, com destaque especial para os setores de finanças, saúde avançada e logística inteligente.`,
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    author: 'Rodrigo Mendonça',
    publishedAt: '2026-10-05T09:30:00Z',
    featured: true,
    breakingNews: false,
    views: 8940,
    readTime: '5 min',
    status: 'PUBLISHED',
    tags: ['Business', 'Estratégia', 'Tecnologia']
  },
  {
    id: 'news-2',
    title: 'Ecossistema de Venture Capital no Brasil Projeta Expansão de 28% no Segundo Semestre',
    slug: 'venture-capital-brasil-expansao-segundo-semestre',
    excerpt: 'Fundos de investimento reorientam liquidez para scale-ups de tecnologia limpa, agritech e serviços corporativos de alta rentabilidade.',
    content: 'O mercado de capitais no Brasil mostra maturidade exemplar, filtrando teses consistentes e com modelo de faturamento comprovado.',
    category: 'Economia',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    author: 'Camila Albuquerque',
    publishedAt: '2026-10-05T08:15:00Z',
    featured: false,
    breakingNews: false,
    views: 6420,
    readTime: '4 min',
    status: 'PUBLISHED',
    tags: ['Economia', 'Investimentos', 'Startups']
  },
  {
    id: 'news-3',
    title: 'O Mercado de Estética e Longevidade Corporativa Move Bilhões com Tecnologia Regenerativa',
    slug: 'mercado-estetica-longevidade-corporativa-tecnologia',
    excerpt: 'Procedimentos não invasivos e biotecnologia personalizada atraem executivos de alto padrão em busca de rejuvenescimento e performance celular.',
    content: 'A convergência entre medicina integrativa, estética de alta precisão e bem-estar executivo se consolidou como uma das verticais mais lucrativas.',
    category: 'Beleza & Estética',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&auto=format&fit=crop&q=80',
    author: 'Dra. Vanessa Guimarães',
    publishedAt: '2026-10-04T18:40:00Z',
    featured: false,
    breakingNews: false,
    views: 5210,
    readTime: '3 min',
    status: 'PUBLISHED',
    tags: ['Beleza', 'Saúde', 'Inovação']
  },
  {
    id: 'news-4',
    title: 'Infraestrutura de Nuvem Soberana e Cibersegurança Elevam Padrões de Compliance',
    slug: 'infraestrutura-nuvem-soberana-ciberseguranca-compliance',
    excerpt: 'Diretrizes rigorosas de privacidade e soberania computacional forçam empresas brasileiras a blindarem suas redes com criptografia pós-quântica.',
    content: 'A segurança corporativa transcendeu o departamento de TI e passou a ser pauta prioritária nos conselhos de administração em todo o país.',
    category: 'Tecnologia & Inovação',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    author: 'Lucas Siqueira',
    publishedAt: '2026-10-04T15:10:00Z',
    featured: false,
    breakingNews: false,
    views: 4310,
    readTime: '4 min',
    status: 'PUBLISHED',
    tags: ['Tech', 'Cloud', 'Cibersegurança']
  },
  {
    id: 'news-5',
    title: 'Gestão de Pessoas e Cultura de Alto Desempenho: O Que os Melhores CEOs Fazem Diferente',
    slug: 'gestao-pessoas-cultura-alto-desempenho-ceos',
    excerpt: 'Pesquisa detalha como retenção de talentos estratégicos e remuneração alinhada ao valuation superam modelos tradicionais de liderança.',
    content: 'Construir equipes autônomas e apaixonadas pela missão da empresa é o segredo de sustentabilidade nas companhias unicórnio.',
    category: 'Carreira & Profissões',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    author: 'Eduardo Brandão',
    publishedAt: '2026-10-04T11:00:00Z',
    featured: false,
    breakingNews: false,
    views: 7190,
    readTime: '6 min',
    status: 'PUBLISHED',
    tags: ['Carreira', 'Liderança', 'Gestão']
  },
  {
    id: 'news-6',
    title: 'Agronegócio Tecnológico Brasileiro Quebra Recorde de Produtividade com Satélites e Drones Autônomos',
    slug: 'agronegocio-tecnologico-recorde-produtividade-drones',
    excerpt: 'Safra com monitoramento térmico em tempo real reduz custos de insumos em 19% e coloca o país no topo mundial da eficiência regenerativa.',
    content: 'O campo é hoje um dos maiores polos mundiais de conectividade, hardware de ponta e análise preditiva de solo.',
    category: 'Empreendedorismo',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200&auto=format&fit=crop&q=80',
    author: 'Mariana Paes',
    publishedAt: '2026-10-03T16:20:00Z',
    featured: false,
    breakingNews: false,
    views: 5880,
    readTime: '5 min',
    status: 'PUBLISHED',
    tags: ['Agro', 'Inovação', 'Sustentabilidade']
  }
];

export const initialVideos: VideoItem[] = [
  {
    id: 'vid-1',
    columnNumber: 1,
    title: 'Fórum Fórmula de Negócios: As Grandes Tendências Econômicas para a Próxima Década',
    description: 'Debate de alto nível com os economistas-chefes dos maiores bancos de investimento e fundadores de empresas de tecnologia.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    duration: '24:18',
    category: 'Business',
    publishedAt: '2026-10-05T10:00:00Z',
    isHeroFeatured: true,
    isShort: false,
    views: 18500
  },
  {
    id: 'vid-2',
    columnNumber: 2,
    title: 'Entrevista Exclusiva: O Futuro da Inteligência Artificial nos Conselhos de Administração',
    description: 'Como membros de conselhos estão usando gêmeos digitais para simular cenários de mercado e fusões bilionárias.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    duration: '14:35',
    category: 'Tecnologia',
    publishedAt: '2026-10-04T14:20:00Z',
    isHeroFeatured: false,
    isShort: false,
    views: 9400
  },
  {
    id: 'vid-short-1',
    columnNumber: 3,
    title: '3 Lições de Negociação para Fechar Contratos Bilionários em 60 Segundos',
    description: 'Dicas práticas de persuasão corporativa aplicadas pelos melhores negociadores internacionais.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    duration: '00:59',
    category: 'Shorts',
    publishedAt: '2026-10-05T09:00:00Z',
    isHeroFeatured: false,
    isShort: true,
    views: 34100
  },
  {
    id: 'vid-short-2',
    columnNumber: 4,
    title: 'O Erro Crítico que 90% das Empresas Cometem ao Anunciar Online',
    description: 'Como calcular métricas reais de conversão e fugir da vaidade de impressões vazias.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    duration: '00:48',
    category: 'Shorts',
    publishedAt: '2026-10-04T18:00:00Z',
    isHeroFeatured: false,
    isShort: true,
    views: 29800
  }
];

export const initialFormulaDaBelezaProgram: FormulaDaBelezaProgram = {
  headline: 'COMUNICAÇÃO QUE CONECTA PESSOAS, MARCAS, HISTÓRIAS E OPORTUNIDADES.',
  topics: [
    'ENTREVISTAS • BUSINESS • BELEZA',
    'EMPREENDEDORISMO • EVENTOS',
    'PERSONALIDADES • INOVAÇÃO'
  ],
  aboutTitle: 'Programa Fórmula da Beleza com Antônio Porto',
  aboutDescription:
    'O Programa Fórmula da Beleza é um formato multimídia de entrevistas e negócios que conecta marcas, personalidades e oportunidades no ecossistema de beleza, estética, empreendedorismo e inovação. Apresentado por Antônio Porto, o programa destaca histórias reais, cases de mercado e tendências que movem o setor.',
  aboutHighlights: [
    'Entrevistas com líderes, marcas e personalidades do mercado',
    'Conteúdo focado em business, beleza, eventos e inovação',
    'Presença em TV e no Portal Fórmula Business News',
    'Oportunidades de participação para convidados e patrocinadores'
  ],
  hostImageUrl: '/assets/logo/antonio-sbt.png',
  logoUrl: '/assets/logo/logo-pro-formula-da-beleza.png',
  videoColumns: [
    {
      id: 'fdb-col-01',
      columnNumber: 1,
      title: 'Programa Fórmula da Beleza — Bastidores do Estúdio',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&auto=format&fit=crop&q=80',
      duration: '12:40',
      active: true,
      featuredOnBanner: true
    },
    {
      id: 'fdb-col-02',
      columnNumber: 2,
      title: 'Entrevista Especial — Marcas & Empreendedorismo',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
      duration: '18:05',
      active: true,
      featuredOnBanner: false
    },
    {
      id: 'fdb-col-03',
      columnNumber: 3,
      title: 'Beleza, Negócios e Inovação no Set',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
      duration: '09:22',
      active: true,
      featuredOnBanner: false
    }
  ]
};

// Rich Magazine Issues with high-resolution page spreads & Readership Reports
export const initialMagazineIssues: MagazineIssue[] = [
  {
    id: 'mag-42',
    issueNumber: 42,
    title: 'A Nova Ordem Econômica & O Poder da IA nos Negócios',
    subtitle: 'Edição Especial de Aniversário — Outubro 2026',
    description: 'Nesta edição magistral, dissecamos as maiores transformações do mercado corporativo, os CEOs mais influentes do país e o futuro dos investimentos em tecnologia e longevidade.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    publishDate: '2026-10-01',
    pagesCount: 10,
    status: 'PUBLISHED',
    featured: true,
    downloadAllowed: true,
    themeColor: '#D9A928',
    clientAccessLink: 'https://portal.formulabusiness.com.br/revista/acesso-parceiro?token=FBN-MAG42-PARTNER',
    clientAdvertisersFeatured: [
      'Vanguardia Capital Partners',
      'Nexus Cloud Technologies',
      'Luxe Biocosméticos',
      'Apex Construtora & Real Estate'
    ],
    pages: [
      {
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
        title: 'Capa Oficial — Edição nº 42',
        description: 'A Nova Ordem Econômica Global & A Liderança Corporativa do Futuro.'
      },
      {
        pageNumber: 2,
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80',
        title: 'Editorial: Construindo o Amanhã',
        description: 'Mensagem do Conselho Editorial da Fórmula Business News sobre inovação contínua.'
      },
      {
        pageNumber: 3,
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
        title: 'Sumário Executivo & Índice',
        description: 'Os principais temas abordados nesta edição especial para líderes.'
      },
      {
        pageNumber: 4,
        imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=80',
        title: 'Especial Finanças: Fusões e Aquisições',
        description: 'Como grandes conglomerados estão estruturando fundos de private equity.',
        featuredAdvertiser: 'Vanguardia Capital Partners'
      },
      {
        pageNumber: 5,
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80',
        title: 'Tecnologia Soberana & Nuvem Blindada',
        description: 'A era dos data centers com eficiência energética verde e ciberdefesa de ponta.',
        featuredAdvertiser: 'Nexus Cloud Technologies'
      },
      {
        pageNumber: 6,
        imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1000&auto=format&fit=crop&q=80',
        title: 'Beleza & Longevidade: O Mercado Regenerativo',
        description: 'Como executivos e celebridades estão investindo em biohacking e estética médica.',
        featuredAdvertiser: 'Luxe Biocosméticos'
      },
      {
        pageNumber: 7,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
        title: 'Real Estate de Alto Padrão & Condomínios Verdes',
        description: 'O boom de empreendimentos corporativos inteligentes nos principais centros.',
        featuredAdvertiser: 'Apex Construtora & Real Estate'
      },
      {
        pageNumber: 8,
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
        title: 'Entrevista Exclusiva: Mulheres que Moldam o Mercado',
        description: 'Conversa franca com as principais diretoras de tecnologia e finanças da América Latina.'
      },
      {
        pageNumber: 9,
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1000&auto=format&fit=crop&q=80',
        title: 'Radar de Investimentos & Projeções 2027',
        description: 'Tabela completa de indicadores macroeconômicos, taxas de juros e commodities.'
      },
      {
        pageNumber: 10,
        imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&auto=format&fit=crop&q=80',
        title: 'Contracapa: O Clube Fórmula Business',
        description: 'Como ingressar no grupo seleto de networking e negócios exclusivos.'
      }
    ],
    analytics: {
      totalReaders: 16840,
      totalPageviews: 114200,
      avgReadTimeMinutes: 8.4,
      completionRate: 72.5,
      downloadsCount: 3410,
      sharesCount: 1890,
      pageDropoffs: [
        { pageNumber: 1, views: 16840, avgSecondsSpent: 42 },
        { pageNumber: 2, views: 16120, avgSecondsSpent: 55 },
        { pageNumber: 3, views: 15400, avgSecondsSpent: 62 },
        { pageNumber: 4, views: 14980, avgSecondsSpent: 78 },
        { pageNumber: 5, views: 14320, avgSecondsSpent: 85 },
        { pageNumber: 6, views: 13910, avgSecondsSpent: 70 },
        { pageNumber: 7, views: 13420, avgSecondsSpent: 65 },
        { pageNumber: 8, views: 12950, avgSecondsSpent: 92 },
        { pageNumber: 9, views: 12510, avgSecondsSpent: 80 },
        { pageNumber: 10, views: 12210, avgSecondsSpent: 45 }
      ],
      devices: { desktop: 58, mobile: 35, tablet: 7 },
      regions: [
        { region: 'São Paulo (SP)', percentage: 38 },
        { region: 'Rio de Janeiro (RJ)', percentage: 17 },
        { region: 'Minas Gerais (MG)', percentage: 12 },
        { region: 'Paraná / Sul (PR/SC/RS)', percentage: 14 },
        { region: 'Nordeste / Centro-Oeste', percentage: 11 },
        { region: 'Internacional / Outros', percentage: 8 }
      ],
      lastUpdated: '2026-10-05T11:00:00Z'
    }
  },
  {
    id: 'mag-41',
    issueNumber: 41,
    title: 'Liderança Estratégica & Escala Global',
    subtitle: 'Edição Setembro 2026',
    description: 'Guia definitivo sobre expansão internacional para empresas brasileiras e consolidação de marcas em novos mercados.',
    coverImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1000&auto=format&fit=crop&q=80',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    publishDate: '2026-09-01',
    pagesCount: 8,
    status: 'PUBLISHED',
    featured: false,
    downloadAllowed: true,
    themeColor: '#38BDF8',
    clientAccessLink: 'https://portal.formulabusiness.com.br/revista/acesso-parceiro?token=FBN-MAG41-PARTNER',
    clientAdvertisersFeatured: ['Global Partners M&A', 'Inova Health Tech'],
    pages: [
      {
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1000&auto=format&fit=crop&q=80',
        title: 'Capa Oficial — Edição nº 41'
      },
      {
        pageNumber: 2,
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80',
        title: 'Editorial'
      },
      {
        pageNumber: 3,
        imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=80',
        title: 'Expansão nos Mercados Norte-Americano e Europeu'
      },
      {
        pageNumber: 4,
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
        title: 'Inovação em Cadeias de Suprimentos'
      },
      {
        pageNumber: 5,
        imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1000&auto=format&fit=crop&q=80',
        title: 'Medicina de Precisão e Longevidade'
      },
      {
        pageNumber: 6,
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
        title: 'Conselhos Consultivos de Alta Performance'
      },
      {
        pageNumber: 7,
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1000&auto=format&fit=crop&q=80',
        title: 'Tributação Internacional e Eficiência Contábil'
      },
      {
        pageNumber: 8,
        imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&auto=format&fit=crop&q=80',
        title: 'Contracapa'
      }
    ],
    analytics: {
      totalReaders: 13200,
      totalPageviews: 82400,
      avgReadTimeMinutes: 7.1,
      completionRate: 68.0,
      downloadsCount: 2790,
      sharesCount: 1420,
      pageDropoffs: [
        { pageNumber: 1, views: 13200, avgSecondsSpent: 38 },
        { pageNumber: 2, views: 12500, avgSecondsSpent: 50 },
        { pageNumber: 3, views: 11900, avgSecondsSpent: 65 },
        { pageNumber: 4, views: 11400, avgSecondsSpent: 72 },
        { pageNumber: 5, views: 10800, avgSecondsSpent: 68 },
        { pageNumber: 6, views: 10100, avgSecondsSpent: 75 },
        { pageNumber: 7, views: 9600, avgSecondsSpent: 59 },
        { pageNumber: 8, views: 8980, avgSecondsSpent: 35 }
      ],
      devices: { desktop: 52, mobile: 41, tablet: 7 },
      regions: [
        { region: 'São Paulo (SP)', percentage: 35 },
        { region: 'Rio de Janeiro (RJ)', percentage: 19 },
        { region: 'Minas Gerais (MG)', percentage: 11 },
        { region: 'Paraná / Sul', percentage: 15 },
        { region: 'Outros', percentage: 20 }
      ],
      lastUpdated: '2026-09-30T18:00:00Z'
    }
  }
];

export const initialAdPlans: AdPlan[] = [
  {
    id: 'plan-1',
    name: '1 Dia — Impacto Rápido',
    durationDays: 1,
    price: 180,
    discountPercentage: 0,
    active: true,
    description: 'Veiculação por 24 horas contínuas. Ideal para lançamentos relâmpago, webinars e eventos de 1 dia.',
    highlighted: false
  },
  {
    id: 'plan-2',
    name: '2 Dias — Fim de Semana / Blitz',
    durationDays: 2,
    price: 320,
    discountPercentage: 11,
    active: true,
    description: 'Cobertura intensiva de 48 horas no portal para dobrar sua exposição comercial.',
    highlighted: false
  },
  {
    id: 'plan-3',
    name: '3 Dias — Triplo Alcance',
    durationDays: 3,
    price: 450,
    discountPercentage: 16,
    active: true,
    description: 'Três dias de alta audiência nos horários de pico corporativo.',
    highlighted: false
  },
  {
    id: 'plan-7',
    name: '7 Dias — Semana Executiva',
    durationDays: 7,
    price: 890,
    discountPercentage: 30,
    active: true,
    description: 'Nosso plano mais procurado. Uma semana completa de veiculação em todas as páginas e matérias.',
    highlighted: true
  },
  {
    id: 'plan-15',
    name: '15 Dias — Meio Mês de Autoridade',
    durationDays: 15,
    price: 1650,
    discountPercentage: 38,
    active: true,
    description: 'Exposição contínua por 15 dias com relatórios diários de cliques e impressões.',
    highlighted: false
  },
  {
    id: 'plan-30',
    name: '30 Dias — Domínio Mensal de Mercado',
    durationDays: 30,
    price: 2800,
    discountPercentage: 48,
    active: true,
    description: 'Presença massiva o mês inteiro. Inclui posicionamento prioritário e otimização contínua.',
    highlighted: false
  }
];

export const initialCoupons: Coupon[] = [
  {
    id: 'coup-1',
    code: 'BEMVINDO10',
    discountPercent: 10,
    firstPurchaseOnly: true,
    active: true,
    expiresAt: '2026-12-31T23:59:59Z',
    usesCount: 14,
    maxUses: 100
  },
  {
    id: 'coup-2',
    code: 'FORMULA20',
    discountPercent: 20,
    firstPurchaseOnly: false,
    active: true,
    expiresAt: '2026-11-30T23:59:59Z',
    usesCount: 8,
    maxUses: 50
  },
  {
    id: 'coup-seller-joao',
    code: 'JOAO10',
    discountPercent: 10,
    firstPurchaseOnly: false,
    sellerOwnerCode: 'JOAO10',
    active: true,
    expiresAt: '2027-12-31T23:59:59Z',
    usesCount: 23
  },
  {
    id: 'coup-seller-marina',
    code: 'MARINA10',
    discountPercent: 10,
    firstPurchaseOnly: false,
    sellerOwnerCode: 'MARINA10',
    active: true,
    expiresAt: '2027-12-31T23:59:59Z',
    usesCount: 11
  }
];

export const initialSellers: AffiliateSeller[] = [
  {
    id: 'seller-1',
    userId: 'user-seller-1',
    name: 'João Victor Silva',
    email: 'joao.consultor@formulabusiness.com.br',
    phone: '+55 (11) 98765-4321',
    code: 'JOAO10',
    couponCode: 'JOAO10',
    commissionRate: 0.10, // 10%
    status: 'ACTIVE',
    totalReferredClients: 14,
    totalSalesVolume: 32400,
    accumulatedCommission: 3240, // 10% on net paid volume
    availableCommission: 1240,
    paidCommission: 1600,
    pendingCommission: 400,
    createdAt: '2026-03-15T10:00:00Z'
  },
  {
    id: 'seller-2',
    userId: 'user-seller-2',
    name: 'Marina Valença',
    email: 'marina.consultora@formulabusiness.com.br',
    phone: '+55 (21) 99881-2233',
    code: 'MARINA10',
    couponCode: 'MARINA10',
    commissionRate: 0.10,
    status: 'ACTIVE',
    totalReferredClients: 8,
    totalSalesVolume: 18500,
    accumulatedCommission: 1850,
    availableCommission: 850,
    paidCommission: 1000,
    pendingCommission: 0,
    createdAt: '2026-05-10T14:30:00Z'
  }
];

export const initialCommissions: CommissionRecord[] = [
  {
    id: 'comm-1',
    sellerCode: 'JOAO10',
    campaignId: 'camp-1',
    campaignCode: 'CAMP-2026-01',
    advertiserName: 'Vanguardia M&A Consultoria',
    originalGrossAmount: 890,
    discountAmount: 89, // 10% discount from JOAO10 coupon
    netPaidAmount: 801, // Client paid R$ 801
    commissionRate: 0.10,
    commissionAmount: 80.10, // Exactly 10% of R$ 801
    status: 'AVAILABLE',
    createdAt: '2026-10-01T14:20:00Z'
  },
  {
    id: 'comm-2',
    sellerCode: 'JOAO10',
    campaignId: 'camp-2',
    campaignCode: 'CAMP-2026-02',
    advertiserName: 'Nexus Cloud Enterprise',
    originalGrossAmount: 2800,
    discountAmount: 280,
    netPaidAmount: 2520,
    commissionRate: 0.10,
    commissionAmount: 252.00, // Exactly 10% of R$ 2520
    status: 'AVAILABLE',
    createdAt: '2026-10-02T10:15:00Z'
  },
  {
    id: 'comm-3',
    sellerCode: 'MARINA10',
    campaignId: 'camp-3',
    campaignCode: 'CAMP-2026-03',
    advertiserName: 'Luxe Dermocosméticos Premium',
    originalGrossAmount: 1650,
    discountAmount: 165,
    netPaidAmount: 1485,
    commissionRate: 0.10,
    commissionAmount: 148.50,
    status: 'AVAILABLE',
    createdAt: '2026-10-03T11:45:00Z'
  }
];

export const initialAdCampaigns: AdCampaign[] = [
  {
    id: 'camp-1',
    campaignCode: 'CAMP-2026-01',
    advertiserId: 'user-adv-1',
    advertiserName: 'Vanguardia M&A Consultoria',
    advertiserEmail: 'contato@vanguardiamna.com.br',
    companyName: 'Vanguardia M&A Partners',
    campaignName: 'Assessoria em Fusões & Aquisições para Médias e Grandes Empresas',
    destinationUrl: 'https://vanguardiamna.com.br?utm_source=formulabusiness',
    creativeDesktopUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=300&fit=crop&q=80',
    creativeMobileUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&q=80',
    position: 'TOP_HEADER',
    planId: 'plan-7',
    planName: '7 Dias — Semana Executiva',
    startDate: '2026-10-01T08:00:00Z',
    endDate: '2026-10-08T23:59:59Z',
    originalPrice: 890,
    couponCodeUsed: 'JOAO10',
    discountAmount: 89,
    netAmountPaid: 801,
    status: 'ACTIVE',
    referredBySellerCode: 'JOAO10',
    sellerCommissionAmount: 80.10,
    sellerCommissionPaid: false,
    createdAt: '2026-10-01T14:00:00Z',
    impressions: 48920,
    clicks: 1420
  },
  {
    id: 'camp-2',
    campaignCode: 'CAMP-2026-02',
    advertiserId: 'user-adv-2',
    advertiserName: 'Nexus Cloud Enterprise',
    advertiserEmail: 'marketing@nexuscloud.tech',
    companyName: 'Nexus Cloud Technologies',
    campaignName: 'Nuvem Segura com IA Dedicada para o Setor Financeiro',
    destinationUrl: 'https://nexuscloud.tech',
    creativeDesktopUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=300&fit=crop&q=80',
    creativeMobileUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop&q=80',
    position: 'BETWEEN_NEWS',
    planId: 'plan-30',
    planName: '30 Dias — Domínio Mensal de Mercado',
    startDate: '2026-10-02T08:00:00Z',
    endDate: '2026-11-01T23:59:59Z',
    originalPrice: 2800,
    couponCodeUsed: 'JOAO10',
    discountAmount: 280,
    netAmountPaid: 2520,
    status: 'ACTIVE',
    referredBySellerCode: 'JOAO10',
    sellerCommissionAmount: 252.00,
    sellerCommissionPaid: false,
    createdAt: '2026-10-02T10:00:00Z',
    impressions: 62400,
    clicks: 2180
  },
  {
    id: 'camp-3',
    campaignCode: 'CAMP-2026-03',
    advertiserId: 'user-adv-3',
    advertiserName: 'Luxe Dermocosméticos Premium',
    advertiserEmail: 'comercial@luxebio.com.br',
    companyName: 'Luxe BioEstética & Cosmetologia',
    campaignName: 'Linha Ouro 24k de Rejuvenescimento Facial para Executivos',
    destinationUrl: 'https://luxebio.com.br',
    creativeDesktopUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=300&fit=crop&q=80',
    creativeMobileUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop&q=80',
    position: 'CONTENT_MIDDLE',
    planId: 'plan-15',
    planName: '15 Dias — Meio Mês de Autoridade',
    startDate: '2026-10-03T08:00:00Z',
    endDate: '2026-10-18T23:59:59Z',
    originalPrice: 1650,
    couponCodeUsed: 'MARINA10',
    discountAmount: 165,
    netAmountPaid: 1485,
    status: 'ACTIVE',
    referredBySellerCode: 'MARINA10',
    sellerCommissionAmount: 148.50,
    sellerCommissionPaid: false,
    createdAt: '2026-10-03T11:00:00Z',
    impressions: 31200,
    clicks: 890
  }
];

export const initialEvents: EventItem[] = [
  {
    id: 'event-1',
    title: 'Fórum Nacional de Líderes Empresariais 2026',
    date: '28 e 29 de Outubro, 2026',
    location: 'Centro de Convenções WTC, São Paulo — SP',
    category: 'CONGRESSO',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    description: 'Mais de 1.500 CEOs, investidores e fundadores reunidos para debater fusões, novos mercados e estratégias de IA.',
    ticketLink: '#'
  },
  {
    id: 'event-2',
    title: 'Prêmio Fórmula de Excelência Empresarial & Longevidade',
    date: '14 de Novembro, 2026',
    location: 'Palácio Tangará, São Paulo — SP',
    category: 'PREMIAÇÃO',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    description: 'A noite de gala mais aguardada do meio corporativo reconhecendo as 50 marcas que mais geraram valor aos acionistas.',
    ticketLink: '#'
  },
  {
    id: 'event-3',
    title: 'Summit Internacional de Estética & Alta Tecnologia Médica',
    date: '05 de Dezembro, 2026',
    location: 'Copacabana Palace, Rio de Janeiro — RJ',
    category: 'NETWORKING',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    description: 'Apresentação de lançamentos globais de bioestimuladores, lasers de picossegundos e medicina integrativa.',
    ticketLink: '#'
  }
];
