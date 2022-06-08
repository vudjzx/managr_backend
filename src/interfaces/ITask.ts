import {IProject} from './projects/IProjects';
import {Document} from 'mongoose';
import {IUser} from './users/IUser';

export interface ITask extends Document {
  name: string;
  description: string;
  completed: boolean;
  deadline: Date;
  priority: string;
  project: IProject['_id'];
  completedBy: IUser['_id'];
}
