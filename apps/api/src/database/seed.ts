import { AppDataSource } from './data-source';
import { seedTaxonomy } from './seed-taxonomy';
import { LessonEntity } from '../modules/content/entities/lesson.entity';
import { SentenceEntity } from '../modules/content/entities/sentence.entity';
import { TopicEntity } from '../modules/content/entities/topic.entity';
import { VocabularyEntity } from '../modules/vocabulary/entities/vocabulary.entity';

const SEED_TOPIC_SLUG = 'greetings-and-introductions';

/**
 * Minimal seed for the "practice by sound" vertical slice.
 * Real content will come from the crawler phase; this proves the stack.
 */
async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const taxo = await seedTaxonomy(AppDataSource);
  console.log(`Taxonomy ready: ${taxo.categories} categories, ${taxo.topics} topics.`);

  const lessonRepo = AppDataSource.getRepository(LessonEntity);
  const topic = await AppDataSource.getRepository(TopicEntity).findOne({ where: { slug: SEED_TOPIC_SLUG } });

  const existing = await lessonRepo.count();
  if (existing > 0) {
    console.log(`Seed skipped: ${existing} lesson(s) already present.`);
    await AppDataSource.destroy();
    return;
  }

  const sentences: Partial<SentenceEntity>[] = [
    {
      order: 1,
      text: 'How are you doing today?',
      ipa: '/haʊ ɑːr juː ˈduːɪŋ təˈdeɪ/',
      translation: 'Hôm nay bạn thế nào?',
      audioUrl: null,
    },
    {
      order: 2,
      text: "I'm doing great, thanks for asking.",
      ipa: '/aɪm ˈduːɪŋ ɡreɪt θæŋks fɔːr ˈɑːskɪŋ/',
      translation: 'Mình rất ổn, cảm ơn bạn đã hỏi.',
      audioUrl: null,
    },
    {
      order: 3,
      text: 'What do you usually do on weekends?',
      ipa: '/wɒt duː juː ˈjuːʒuəli duː ɒn ˈwiːkˌɛndz/',
      translation: 'Cuối tuần bạn thường làm gì?',
      audioUrl: null,
    },
    {
      order: 4,
      text: 'I like to read and go for a walk.',
      ipa: '/aɪ laɪk tuː riːd ænd ɡəʊ fɔːr ə wɔːk/',
      translation: 'Mình thích đọc sách và đi dạo.',
      audioUrl: null,
    },
    {
      order: 5,
      text: 'It was really nice talking to you.',
      ipa: '/ɪt wɒz ˈrɪəli naɪs ˈtɔːkɪŋ tuː juː/',
      translation: 'Rất vui được nói chuyện với bạn.',
      audioUrl: null,
    },
  ];

  const lesson = lessonRepo.create({
    slug: 'everyday-small-talk',
    title: 'Everyday Small Talk',
    description: 'Warm up with five common conversational lines. Listen, then shadow each one.',
    level: 'beginner',
    topic,
    source: 'seed',
    sentences: sentences as SentenceEntity[],
  });

  await lessonRepo.save(lesson);
  console.log('Seed complete: 1 lesson, 5 sentences.');

  // Seed vocabulary so GET /vocabulary/today returns words immediately.
  const vocabRepo = AppDataSource.getRepository(VocabularyEntity);
  const vocabData = [
    {
      word: 'doing',
      meaningVn: 'đang làm, đang thực hiện',
      ipa: '/ˈduːɪŋ/',
      synonyms: ['performing', 'carrying out'],
      exampleSentences: ['How are you doing today?', 'She is doing her homework.'],
      level: 'beginner',
    },
    {
      word: 'great',
      meaningVn: 'tuyệt vời, rất tốt',
      ipa: '/ɡreɪt/',
      synonyms: ['excellent', 'wonderful', 'fantastic'],
      exampleSentences: ["I'm doing great, thanks!", 'That was a great idea.'],
      level: 'beginner',
    },
    {
      word: 'usually',
      meaningVn: 'thường thường, thường xuyên',
      ipa: '/ˈjuːʒuəli/',
      synonyms: ['generally', 'normally', 'typically'],
      exampleSentences: ['What do you usually do on weekends?', 'I usually wake up at 7 am.'],
      level: 'beginner',
    },
    {
      word: 'weekend',
      meaningVn: 'cuối tuần',
      ipa: '/ˈwiːkˌɛnd/',
      synonyms: ['days off', 'Saturday and Sunday'],
      exampleSentences: ['What do you do on weekends?', 'I love spending weekends with family.'],
      level: 'beginner',
    },
    {
      word: 'talking',
      meaningVn: 'nói chuyện, trò chuyện',
      ipa: '/ˈtɔːkɪŋ/',
      synonyms: ['speaking', 'chatting', 'conversing'],
      exampleSentences: ['It was nice talking to you.', 'We were talking for hours.'],
      level: 'beginner',
    },
  ];

  for (const data of vocabData) {
    const vocab = vocabRepo.create({ ...data, topic, audioUrl: null });
    await vocabRepo.save(vocab);
  }

  console.log(`Seed complete: ${vocabData.length} vocabulary words.`);
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
