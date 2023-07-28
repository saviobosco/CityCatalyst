import getConfig from 'next/config';
import { Sequelize } from 'sequelize';
import { initModels } from './init-models';

const { serverRuntimeConfig } = getConfig();

export const db: {
  initialized: boolean,
  initialize: () => Promise<void>,
  sequelize?: Sequelize | null,
  models: Record<string, any>,
} = {
  initialized: false,
  sequelize: null,
  initialize,
  models: {},
};

async function initialize() {
  const config = serverRuntimeConfig.dbConfig;

  const sequelize = new Sequelize({
    host: config.host,
    database: config.name,
    dialect: 'postgres',
    username: config.username,
    password: config.password,
  });

  db.models = initModels(sequelize);

  db.sequelize = sequelize;
  db.initialized = true;
}

