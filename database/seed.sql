INSERT INTO projects (
  title, slug, category, description, long_description, tech, repository_url,
  live_url, demo_url, thumbnail_url, featured, status, sort_order, accent
) VALUES
(
  'MediLocker', 'medilocker', 'Healthcare · Security',
  'A secure health-record platform designed around privacy, clear access, and dependable care workflows.',
  'MediLocker explores how people and care teams can manage sensitive medical records with a stronger sense of control. The project brings together secure document storage, hospital workflows, and a privacy-first approach to sharing information.',
  ARRAY['FastAPI', 'PostgreSQL', 'Redis', 'AWS S3'], 'https://github.com/godnix7/MediLocker', 'https://medilocker-main.vercel.app/', '', '/shots/medilocker.png', true, 'published', 10, 'citrus'
),
(
  'Lynxis AI', 'lynxis-ai', 'AI · Developer tools',
  'A multi-agent code intelligence platform for making large codebases easier to understand and navigate.',
  'Lynxis AI brings agent-based analysis and interactive code exploration into one workspace. It focuses on helping developers build context around unfamiliar projects and move from questions to useful answers.',
  ARRAY['Node.js', 'Express', 'Prisma', 'Three.js', 'Docker'], 'https://github.com/godnix7/Lynxis', 'https://lynxis.vercel.app', '', '/shots/lynxis.png', true, 'published', 20, 'violet'
),
(
  'EventByte', 'eventbyte', 'Events · Real time',
  'A hackathon operations platform that connects participant tracking, judging, and live event updates.',
  'EventByte is built to make the moving pieces of a hackathon easier to coordinate. It combines participant and event management with real-time judging workflows and updates for teams and organizers.',
  ARRAY['Django', 'TypeScript', 'TanStack Query', 'Socket.io'], 'https://github.com/godnix7/EventByte', 'https://event-byte.vercel.app', '', '/shots/eventbyte.png', false, 'published', 30, 'coral'
),
(
  'Deepfake Detection', 'deepfake-detection', 'Computer vision · Forensics',
  'A video-forensics project that detects and classifies AI-generated deepfake media.',
  'Deepfake Detection explores the use of computer vision and deep learning to identify synthetic video. The project focuses on helping viewers assess manipulated media through an accessible detection workflow.',
  ARRAY['Python', 'Computer vision', 'Deep learning'], 'https://github.com/godnix7/Deepfake-detection', '', '', '', false, 'published', 40, 'coral'
),
(
  'LocalMusic', 'localmusic', 'Media · Streaming',
  'A focused music experience backed by fast search, streaming, and subscription-aware controls.',
  'LocalMusic combines a listening experience with an operations layer for managing subscriptions and media. The project explores responsive search and low-latency playback flows built on a real-time backend.',
  ARRAY['Fastify', 'PostgreSQL', 'Elasticsearch', 'Redis', 'WebSockets'], 'https://github.com/godnix7/LocalMusic', 'https://localmusic-three.vercel.app', '', '/shots/localmusic.png', false, 'published', 50, 'blue'
),
(
  'Althea', 'althea', 'AI · Wellbeing',
  'An accessible emotional-support concept exploring gentle, everyday interactions with language technology.',
  'Althea is an early exploration of conversational support, with an emphasis on an approachable experience and useful, thoughtful responses. It studies how language interfaces can make help feel easier to reach.',
  ARRAY['Python', 'Flask', 'NLP', 'Vercel'], 'https://github.com/godnix7/Althea', 'https://althea-gamma.vercel.app', '', '/shots/althea.png', false, 'published', 60, 'lavender'
),
(
  'Harvest Club', 'harvest-club', 'Community · Product',
  'A community platform built to bring local discovery and useful connections into one place.',
  'Harvest Club is a community product focused on making local discovery feel approachable and useful. It brings people, places, and shared interests together in a polished web experience.',
  ARRAY['TypeScript', 'Next.js'], 'https://github.com/godnix7/harvest-club', 'https://harvestclub.vercel.app', '', '/shots/harvest.png', false, 'published', 70, 'mint'
),
(
  'SIH Internal', 'sih-internal', 'Civic technology · Hackathon',
  'An internal-round build for the Smart India Hackathon, focused on a clear and dependable product workflow.',
  'SIH Internal is a collaborative build created for the internal round of the Smart India Hackathon. The project explores how a focused product workflow can support a real-world challenge under a tight delivery schedule.',
  ARRAY['TypeScript', 'Next.js'], 'https://github.com/godnix7/SIH-Internal', '', '', '', false, 'published', 80, 'blue'
),
(
  'MotionSense', 'motionsense', 'Computer vision · Research',
  'Human activity recognition from video, using a MobileNetV3 feature extractor and temporal LSTM model.',
  'MotionSense studies human activity recognition from video using a MobileNetV3-Large frame encoder and an LSTM over short frame windows. Its Streamlit application is the inference surface for video upload and results; model training stays in the original repository.',
  ARRAY['PyTorch', 'MobileNetV3', 'LSTM', 'OpenCV', 'Streamlit'], 'https://github.com/godnix7/MotionSense---Deep-Learning-Project', '', '', '', true, 'published', 90, 'amber'
),
(
  'UniMonitor', 'unimonitor', 'Linux · Systems',
  'A Linux monitoring utility presented through a constrained, allowlisted demonstration.',
  'UniMonitor is a Linux-based systems utility. Its live demo will expose only reviewed operations in an isolated service; the website will clearly distinguish host measurements from any simulated values.',
  ARRAY['Bash', 'Linux', 'Docker'], 'https://github.com/godnix7/Unimonitor', '', '', '', false, 'published', 100, 'mint'
)
ON CONFLICT (slug) DO NOTHING;
