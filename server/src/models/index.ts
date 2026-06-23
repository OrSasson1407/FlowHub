import { Integration } from './integration.model';
import { Project } from './project.model';
import { Task } from './task.model';
import { User } from './user.model';

User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Integration, { foreignKey: 'userId', as: 'integrations' });
Integration.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Project, { foreignKey: 'userId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { Integration, Project, Task, User };
