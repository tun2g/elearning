import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { StorageObjectEntity } from 'src/modules/media/entities/storage-object.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

import { SentenceEntity } from './sentence.entity';
import { TopicEntity } from './topic.entity';

export type LessonLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonMediaKind = 'audio' | 'youtube';

@Entity({ name: 'lessons' })
export class LessonEntity extends AuditableEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160 })
  slug!: string;

  @Column({ type: 'varchar', length: 240 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'beginner' })
  level!: LessonLevel;

  /** Thematic grouping. Null when no taxonomy topic matched on import. */
  @ManyToOne(() => TopicEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'topic_id' })
  topic!: TopicEntity | null;

  /** Attribution for crawled content (the source site/dataset). */
  @Column({ type: 'varchar', length: 120, nullable: true })
  source!: string | null;

  /** For embedded sources (e.g. a YouTube watch URL); null for native-audio lessons. */
  @Column({ name: 'external_url', type: 'varchar', length: 600, nullable: true })
  externalUrl!: string | null;

  @Column({ name: 'media_kind', type: 'varchar', length: 20, nullable: true })
  mediaKind!: LessonMediaKind | null;

  /** Management link to a hosted lesson-level audio file (e.g. a crawled MP3).
   *  Null for YouTube lessons, whose `external_url` is an external embed. */
  @ManyToOne(() => StorageObjectEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'media_object_id' })
  mediaObject!: StorageObjectEntity | null;

  @OneToMany(() => SentenceEntity, (sentence) => sentence.lesson, {
    cascade: true,
  })
  sentences!: SentenceEntity[];
}
