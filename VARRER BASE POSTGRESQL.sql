--   anapaula_depereira@yahoo.com

DO $$ 
DECLARE
    SearchText TEXT := 'anapaula_depereira@yahoo.com';  -- Defina o texto de busca
    v_SchemaName TEXT;  -- Renomeado para evitar ambiguidade
    v_TableName TEXT;
    v_ColumnName TEXT;
    r RECORD;
BEGIN
    -- Cria a tabela temporária para armazenar os resultados
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'results') THEN
        DROP TABLE public.results;
    END IF;
    
    CREATE TEMP TABLE results (
        SchemaName TEXT,
        TableName TEXT,
        ColumnName TEXT,
        SampleData TEXT
    );

    -- Itera sobre as tabelas e colunas
    FOR r IN 
        SELECT 
            n.nspname AS SchemaName,
            c.relname AS TableName,
            a.attname AS ColumnName
        FROM 
            pg_catalog.pg_namespace n
            JOIN pg_catalog.pg_class c ON n.oid = c.relnamespace
            JOIN pg_catalog.pg_attribute a ON c.oid = a.attrelid
            JOIN pg_catalog.pg_type t ON a.atttypid = t.oid
        WHERE 
            n.nspname NOT IN ('pg_catalog', 'information_schema')  -- Ignorar schemas do sistema
            AND a.attnum > 0  -- Ignorar atributos internos
            AND t.typname IN ('varchar', 'text', 'character varying', 'character')
    LOOP
        -- Atribuindo valores de r para as variáveis PL/pgSQL
        v_SchemaName := r.SchemaName;
        v_TableName := r.TableName;
        v_ColumnName := r.ColumnName;

        -- Criação da consulta dinâmica para cada coluna
        EXECUTE format(
            'INSERT INTO results (SchemaName, TableName, ColumnName, SampleData)
            SELECT %L, %L, %L, LEFT(%I, 100)
            FROM %I.%I
            WHERE %I LIKE %L',
            v_SchemaName, v_TableName, v_ColumnName, v_ColumnName, v_SchemaName, v_TableName, v_ColumnName, '%' || SearchText || '%'
        );
    END LOOP;

    -- Seleciona os resultados
    -- Exemplo: SELECT * FROM results WHERE SampleData LIKE '%anapaula_depereira@yahoo.com%'
    RAISE NOTICE '%', (SELECT json_agg(results) FROM results);

END $$;
