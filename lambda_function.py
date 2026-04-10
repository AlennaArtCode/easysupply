import json
import boto3
import uuid
import datetime

# Inicialización de Clientes AWS
sagemaker = boto3.client('sagemaker-runtime')
dynamodb = boto3.resource('dynamodb')

# Parámetros de Infraestructura
ENDPOINT_NAME = 'api-xgboost-predicciones-v1'
TABLE_NAME = 'HistorialPredicciones'
SCALAR_FACTOR = 124717.0

def lambda_handler(event, context):
    try:
        # 1. Gestión de CORS (Preflight)
        http_method = event.get('httpMethod') or event.get('requestContext', {}).get('http', {}).get('method', '')
        if http_method == 'OPTIONS':
            return _build_response(200, "CORS OK")

        # Restaurar soporte GET para leer el historial de DynamoDB
        if http_method == 'GET':
            table = dynamodb.Table(TABLE_NAME)
            db_scan = table.scan(Limit=100)
            return _build_response(200, {"historial": db_scan.get('Items', [])})

        # 2. Extracción y Limpieza del Body (Solo para POST)
        raw_body = event.get('body', '')
        if not raw_body:
            return _build_response(400, {'error': 'Body vacío'})
            
        body = json.loads(raw_body.strip()) if isinstance(raw_body, str) else raw_body

        # 3. Lógica Universal de Datos (Objeto o Lista)
        # Si envías {"tensor": [...]} usamos eso. Si no, buscamos las llaves sueltas.
        if 'tensor' in body:
            tensor = body['tensor']
        else:
            # Mapeo manual para asegurar el orden correcto que espera el XGBoost
            variables = [
                'familia', 'wti', 'diaSemana', 'festivo', 'quincena', 
                'ventasPasadas', 'promocion', 'indiceTemp', 'tendencia'
            ]
            tensor = [float(body.get(var, 0.0)) for var in variables]

        # Validación final de longitud
        if len(tensor) != 9:
            return _build_response(400, {'error': f'Se esperaban 9 variables, llegaron {len(tensor)}'})

        csv_payload = ','.join(map(str, tensor))

        # 4. Invocación a SageMaker
        response = sagemaker.invoke_endpoint(
            EndpointName=ENDPOINT_NAME,
            ContentType='text/csv',
            Body=csv_payload
        )
        
        # 5. Procesamiento y Descompresión
        result_raw = response['Body'].read().decode('utf-8').strip()
        # Limpieza por si SageMaker devuelve comas extra
        ml_prediction = float(result_raw.split(',')[0])
        volumen_final = round(ml_prediction * SCALAR_FACTOR, 2)

        # 6. Persistencia en DynamoDB (Historial)
        request_id = str(uuid.uuid4())
        table = dynamodb.Table(TABLE_NAME)
        table.put_item(
            Item={
                'id_registro': request_id,
                'Fecha': datetime.datetime.utcnow().isoformat(),
                'Datos_Entrada': json.dumps(body),
                'Volumen_Proyectado': str(volumen_final),
                'Modelo': 'XGBoost_V1_Produccion'
            }
        )

        # 7. Respuesta Exitosa
        return _build_response(200, {
            "status": "success",
            "volumen": volumen_final,
            "id": request_id
        })

    except Exception as e:
        print(f"ERROR CRÍTICO: {str(e)}")
        return _build_response(500, {'error': 'Error en procesamiento', 'detalle': str(e)})

def _build_response(status_code, body_payload):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body_payload)
    }
