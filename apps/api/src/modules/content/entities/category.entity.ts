import { Column, Entity, Index, OneToMany } from 'typeorm';

import { AuditableEntity } from 'src/shared/entities/auditable.entity';

import { TopicEntity } from './topic.entity';

/** Top-level grouping for topics (e.g. "Daily Life & Self", "Travel & Transport"). */
@Entity({ name: 'categories' })
export class CategoryEntity extends AuditableEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  slug!: string;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => TopicEntity, (topic) => topic.category)
  topics!: TopicEntity[];
}
