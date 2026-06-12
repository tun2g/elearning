import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { StorageObjectEntity } from 'src/modules/media/entities/storage-object.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

import { LessonEntity } from './lesson.entity';

@Entity({ name: 'sentences' })
@Index(['lesson', 'order'])
export class SentenceEntity extends AuditableEntity {
  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'text' })
  text!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  ipa!: string | null;

  @Column({ type: 'text', nullable: true })
  translation!: string | null;

  /** Denormalized URL to play (managed object's URL, or null for device-synth). */
  @Column({ name: 'audio_url', type: 'text', nullable: true })
  audioUrl!: string | null;

  /** Management link to the stored audio file (set only for files we host). */
  @ManyToOne(() => StorageObjectEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'audio_object_id' })
  audioObject!: StorageObjectEntity | null;

  @ManyToOne(() => LessonEntity, (lesson) => lesson.sentences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: LessonEntity;
}
