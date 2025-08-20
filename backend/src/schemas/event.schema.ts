import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ 
    required: true,
    type: String 
  })
  sport: string;

  @Prop({ 
    required: true,
    type: String 
  })
  eventName: string;

  @Prop({ 
    required: true,
    type: String 
  })
  location: string;

  @Prop({ 
    required: true,
    type: Date 
  })
  eventTime: Date;

  @Prop({ 
    required: true,
    type: String 
  })
  teamA: string;

  @Prop({ 
    required: true,
    type: String 
  })
  teamB: string;

  @Prop({ 
    type: Number,
    default: 0 
  })
  scoreA: number;

  @Prop({ 
    type: Number,
    default: 0 
  })
  scoreB: number;

  @Prop({ 
    type: String,
    enum: ['Planlandı', 'Canlı', 'Bitti'],
    default: 'Planlandı'
  })
  status: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
