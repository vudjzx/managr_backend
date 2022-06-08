import {IUser} from '../users/IUser';
import {Document} from 'mongoose';
import {ITask} from '../ITask';

export interface IProject extends Document {
  name: string;
  description: string;
  deadline: Date;
  client: string;
  owner: IUser['_id'];
  collaborators: IUser['_id'][];
  tasks: ITask['_id'][];
}
