import { DataSource } from 'typeorm';

import { dataSourceOptions } from 'database/data-source-options';

export default new DataSource(dataSourceOptions);
