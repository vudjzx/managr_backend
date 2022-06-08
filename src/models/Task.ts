import {Schema, model} from 'mongoose';
import {ITask} from '../interfaces/ITask';

const taskSchema = new Schema<ITask>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    deadline: {
      type: Date,
      required: true,
      default: new Date(),
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {timestamps: true},
);

const Task = model<ITask>('Task', taskSchema);

export default Task;
