@echo off
setlocal EnableDelayedExpansion

if "%1"=="" (
    echo ERROR: Stack name is required
    echo Usage: setup-cognito.bat ^<stack-name^>
    echo Example: setup-cognito.bat game
    exit /b 1
)

set STACK_NAME=%1-cognito
set REGION=us-west-2

echo Setting up Cognito User Pool for stack: %STACK_NAME%
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

REM Deploy Cognito stack
echo Deploying Cognito User Pool...
aws cloudformation deploy ^
    --template-file server\iac\cognito.yml ^
    --stack-name %STACK_NAME% ^
    --capabilities CAPABILITY_IAM ^
    --region %REGION%

if errorlevel 1 (
    echo ERROR: Failed to deploy Cognito stack
    exit /b 1
)

REM Extract Cognito outputs
echo Extracting Cognito configuration...
for /f "delims=" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text --region %REGION% 2^>nul') do set COGNITO_USER_POOL_ID=%%i
for /f "delims=" %%j in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" --output text --region %REGION% 2^>nul') do set COGNITO_CLIENT_ID=%%j
for /f "delims=" %%k in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey=='UserPoolArn'].OutputValue" --output text --region %REGION% 2^>nul') do set COGNITO_USER_POOL_ARN=%%k

REM Validate outputs
if "!COGNITO_USER_POOL_ID!"=="" (
    echo ERROR: Failed to extract Cognito User Pool ID
    exit /b 1
)
if "!COGNITO_CLIENT_ID!"=="" (
    echo ERROR: Failed to extract Cognito Client ID
    exit /b 1
)
if "!COGNITO_USER_POOL_ARN!"=="" (
    echo ERROR: Failed to extract Cognito User Pool ARN
    exit /b 1
)

REM Create or update .env file
echo Creating/updating dev.env file...
if not exist dev.env (
    echo AWS_REGION=%REGION% > dev.env
) else (
    REM Remove existing Cognito entries
    findstr /v "COGNITO_" dev.env > temp.env
    move temp.env dev.env >nul
)

REM Append Cognito config to .env file
echo COGNITO_USER_POOL_ID=!COGNITO_USER_POOL_ID! >> dev.env
echo COGNITO_CLIENT_ID=!COGNITO_CLIENT_ID! >> dev.env
echo COGNITO_USER_POOL_ARN=!COGNITO_USER_POOL_ARN! >> dev.env

echo.
echo ✅ Cognito setup complete!
echo User Pool ID: !COGNITO_USER_POOL_ID!
echo Client ID: !COGNITO_CLIENT_ID!
echo User Pool ARN: !COGNITO_USER_POOL_ARN!

copy dev.env server\dev.env
echo.
echo Configuration saved to server\dev.env