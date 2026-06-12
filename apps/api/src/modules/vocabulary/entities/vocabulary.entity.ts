import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { LessonEntity } from 'src/modules/content/entities/lesson.entity';
import { StorageObjectEntity } from 'src/modules/media/entities/storage-object.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

@Entity({ name: 'vocabularies' })
export class VocabularyEntity extends AuditableEntity {
  @Column({ type: 'varchar', length: 120 })
  word!: string;

  @Column({ name: 'meaning_vn', type: 'text' })
  meaningVn!: string;

  @Column({ name: 'meaning_en', type: 'text', nullable: true })
  meaningEn!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  ipa!: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  synonyms!: string[];

  @Column({ name: 'example_sentences', type: 'jsonb', default: '[]' })
  exampleSentences!: string[];

  @Column({ type: 'varchar', length: 120, nullable: true })
  topic!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'beginner' })
  level!: string;

  /** Denormalized URL to play (managed object's URL, or null for device-synth). */
  @Column({ name: 'audio_url', type: 'text', nullable: true })
  audioUrl!: string | null;

  /** Management link to the stored audio file (set only for files we host). */
  @ManyToOne(() => StorageObjectEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'audio_object_id' })
  audioObject!: StorageObjectEntity | null;

  @ManyToOne(() => LessonEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_lesson_id' })
  sourceLesson!: LessonEntity | null;
}
