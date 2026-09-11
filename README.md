# Extrator Giz -> GENNERA 4.0

## Version Node
```
v18.17.1
```
## Version NPM
```
9.6.7
```

## Project setup
```
npm install
```

## DATABASE
```
POSTGRESQL 13.6
```

Verificação de banco de dados, Caso não exista é criado:

```
npm run db
```
## Backup

Para backup acesse a pasta "C:\Program Files\PostgreSQL\16\bin", abra o cmd como adm e execute o comando:

```
pg_dump.exe --host localhost --port 5432 --username postgres --format tar --file c:\integrate\source\DEV\integracao.webapi\bkp_database\db_hub.backup integrate_15052024
```

## Restore Backup

Para backup acesse a pasta "C:\Program Files\PostgreSQL\16\bin", abra o cmd como adm e execute o comando:

```
pg_restore.exe --host localhost --port 5432 --username postgres --dbname integrate_15052024 C:\dev\BKP_15052024.backup
```

---

## Init DataBase Migrations


### Migrations

Para Executar as migrations:
```
npx sequelize-cli db:migrate
```

Para Desfazer uma migrations:
```
npx sequelize-cli db:migrate:undo
```

Para criar uma nova Migration, use o comando:
```
npx sequelize-cli migration:generate --name nomeDaMigration
```

### Seeders

Para criar uma nova Seeders (Usada para popular o banco)

```
npx sequelize-cli seed:generate --name nomeDaSeeders
```

Para executar as Seeders

```
npx sequelize-cli db:seed:all
```

Para desfazer (rowback) a última Seeders criada

```
npx sequelize-cli db:seed:undo
```

Para desfazer (rowback) de uma Seeder específica

```
npx sequelize-cli db:seed:undo --seed nomeDaSeeder
```

Para desfazer (rowback) TODAS as Seeders criadas

```
npx sequelize-cli db:seed:undo:all
```

---

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```
