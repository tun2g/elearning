import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from 'src/shared/entities/auditable.entity';

import { CategoryEntity } from './category.entity';

/** A theme (e.g. "Ordering at a Café") that lessons and vocab attach to.
 *  CEFR lives here as the topic's primary banding; individual lessons/vocab
 *  keep their own `level` for fine-grained spiral content. */
export type CefrLevel = 'beginner' | 'intermediate' | 'advanced';

@Entity({ name: 'topics' })
export class TopicEntity extends AuditableEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  slug!: string;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ name: 'cefr_level', type: 'varchar', length: 20, default: 'beginner' })
  cefrLevel!: CefrLevel;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => CategoryEntity, (category) => category.topics, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: CategoryEntity;
}
