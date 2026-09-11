
-- 'MARIA DA COSTA'

DECLARE @SearchText NVARCHAR(255)
SET @SearchText = 'MARIA DA COSTA'

-- Cria uma tabela temporária para armazenar os resultados
IF OBJECT_ID('tempdb..#Results') IS NOT NULL
    DROP TABLE #Results

CREATE TABLE #Results (
    SchemaName NVARCHAR(128),
    TableName NVARCHAR(128),
    ColumnName NVARCHAR(128),
    SampleData NVARCHAR(MAX)
)

DECLARE @SchemaName NVARCHAR(128)
DECLARE @TableName NVARCHAR(128)
DECLARE @ColumnName NVARCHAR(128)
DECLARE @SQL NVARCHAR(MAX)

-- Cursor para iterar através de todas as tabelas e colunas
DECLARE cur CURSOR FOR
SELECT 
    s.name AS SchemaName,
    t.name AS TableName,
    c.name AS ColumnName
FROM 
    sys.schemas AS s
    INNER JOIN sys.tables AS t ON s.schema_id = t.schema_id
    INNER JOIN sys.columns AS c ON t.object_id = c.object_id
    INNER JOIN sys.types AS y ON c.user_type_id = y.user_type_id
WHERE 
    y.name IN ('varchar', 'nvarchar')

OPEN cur
FETCH NEXT FROM cur INTO @SchemaName, @TableName, @ColumnName

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Construção da consulta dinâmica
    SET @SQL = 'INSERT INTO #Results (SchemaName, TableName, ColumnName, SampleData)
                SELECT ''' + @SchemaName + ''', ''' + @TableName + ''', ''' + @ColumnName + ''', LEFT(' + QUOTENAME(@ColumnName) + ', 100)
                FROM ' + QUOTENAME(@SchemaName) + '.' + QUOTENAME(@TableName) + '
                WHERE ' + QUOTENAME(@ColumnName) + ' LIKE ''%' + @SearchText + '%'''

    -- Executa a consulta dinâmica
    EXEC sp_executesql @SQL

    FETCH NEXT FROM cur INTO @SchemaName, @TableName, @ColumnName
END

CLOSE cur
DEALLOCATE cur

-- Seleciona os resultados
--SELECT DISTINCT * FROM #Results where "SampleData" like 'CELENE MARIA DA COSTA LEAL'

-- Remove a tabela temporária
--DROP TABLE #Results



