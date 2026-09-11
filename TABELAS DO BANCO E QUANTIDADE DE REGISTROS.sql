SELECT 
    s.name AS SchemaName,
    t.name AS TableName,
    p.[rows] AS RowCounts
FROM 
    sys.tables AS t
INNER JOIN 
    sys.schemas AS s ON t.schema_id = s.schema_id
INNER JOIN 
    sys.partitions AS p ON t.object_id = p.object_id
WHERE 
    p.index_id IN (0, 1) -- 0: Heap Table, 1: Clustered Index
ORDER BY 
    p.[rows] DESC;
