-- Create the database user used by application
DO
$do$
BEGIN
   IF NOT EXISTS (
  	SELECT FROM pg_catalog.pg_user WHERE usename = '${runningdinner-user-name}'
   ) THEN
      CREATE USER ${runningdinner-user-name} WITH PASSWORD '${runningdinner-user-password}';
   END IF;
END
$do$;

GRANT ALL PRIVILEGES ON DATABASE "${runningdinner-database-name}" to ${runningdinner-user-name};
GRANT USAGE ON SCHEMA public TO ${runningdinner-user-name};

DO
$do$
BEGIN
   IF NOT EXISTS (
	SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${runningdinner-schema-name}'
   ) THEN
      CREATE SCHEMA ${runningdinner-schema-name};
   END IF;
END
$do$;

GRANT USAGE ON SCHEMA ${runningdinner-schema-name} TO ${runningdinner-user-name};