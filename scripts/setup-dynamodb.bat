@echo off
setlocal EnableDelayedExpansion

if "%1"=="" (
    echo ERROR: Stack name is required
    echo Usage: setup-dynamodb.bat ^<stack-name^>
    echo Example: setup-dynamodb.bat game
    exit /b 1
)

set STACK_NAME=%1-dynamodb
set REGION=us-west-2

echo Setting up DynamoDB tables for stack: %STACK_NAME%
echo Region: %REGION%

REM Check AWS CLI installation
aws --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: AWS CLI not found. Please install AWS CLI first.
    echo Download from: https://aws.amazon.com/cli/
    exit /b 1
)

REM Check if AWS credentials are configured
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo ERROR: AWS credentials not configured. Please run 'aws configure' first.
    exit /b 1
)

REM Deploy DynamoDB stack
echo Deploying DynamoDB tables...
aws cloudformation deploy ^
    --template-file server\iac\dynamodb.yml ^
    --stack-name %STACK_NAME% ^
    --region %REGION%

if errorlevel 1 (
    echo ERROR: Failed to deploy DynamoDB stack
    exit /b 1
)

REM Extract table names
echo Extracting DynamoDB table configuration...
for /f "delims=" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey=='ItemsTableName'].OutputValue" --output text --region %REGION% 2^>nul') do set ITEMS_TABLE=%%i
for /f "delims=" %%j in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey=='InventoryTableName'].OutputValue" --output text --region %REGION% 2^>nul') do set INVENTORY_TABLE=%%j
for /f "delims=" %%k in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey=='LocationTableName'].OutputValue" --output text --region %REGION% 2^>nul') do set LOCATION_TABLE=%%k
for /f "delims=" %%l in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey=='UsersTableName'].OutputValue" --output text --region %REGION% 2^>nul') do set USERS_TABLE=%%l
for /f "delims=" %%m in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey=='UsernamesTableName'].OutputValue" --output text --region %REGION% 2^>nul') do set USERNAMES_TABLE=%%m
for /f "delims=" %%n in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey=='PersonaTableName'].OutputValue" --output text --region %REGION% 2^>nul') do set PERSONA_TABLE=%%n

REM Create or update .env file with DynamoDB table names
echo Creating/updating dev.env file...
if not exist dev.env (
    echo AWS_REGION=%REGION% > dev.env
) else (
    REM Remove existing DynamoDB entries
    findstr /v "DYNAMODB_TABLE_" dev.env > temp.env
    move temp.env dev.env >nul
)

REM Append DynamoDB config to .env file
echo DYNAMODB_TABLE_ITEMS=!ITEMS_TABLE! >> dev.env
echo DYNAMODB_TABLE_INVENTORY=!INVENTORY_TABLE! >> dev.env
echo DYNAMODB_TABLE_LOCATION=!LOCATION_TABLE! >> dev.env
echo DYNAMODB_TABLE_USERS=!USERS_TABLE! >> dev.env
echo DYNAMODB_TABLE_USERNAMES=!USERNAMES_TABLE! >> dev.env
echo DYNAMODB_TABLE_PERSONA=!PERSONA_TABLE! >> dev.env

echo.
echo ✅ DynamoDB setup complete!
echo Items Table: !ITEMS_TABLE!
echo Inventory Table: !INVENTORY_TABLE!
echo Location Table: !LOCATION_TABLE!
echo Users Table: !USERS_TABLE!
echo Usernames Table: !USERNAMES_TABLE!
echo Persona Table: !PERSONA_TABLE!

copy dev.env server\dev.env
echo.
echo Configuration saved to server\dev.env