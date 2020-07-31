import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class EventReminderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column()
  name!: string;

  @Column()
  eventDate!: Date;
}
