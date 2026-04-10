# Arquitectura y Diseño de Sistemas - Easy Supply 🚀

## 1. Topología del Sistema (Cloud Workflow)

El flujo logístico de extremo a extremo (End-to-End) en la nube de AWS se estructura de la siguiente forma para maximizar desacoplamiento, resiliencia y alta disponibilidad:

1.  **Frontend (React/Vite):** El cliente captura interacciones dinámicas de los usuarios (a través de *sliders*) y ensambla el tensor numérico de 9 variables de entorno. La aplicación está asegurada vía **Amazon Cognito** (Módulo Amplify), y al aprobar autenticación envía un Web Token JWT.
2.  **API Gateway (API RESTful):** Actúa como puerta de enlace segura. Valida el JWT y las peticiones *Preflight* de CORS en milisegundos, para luego enrutar la petición POST (que contiene el tensor en JSON) al backend de procesamiento.
3.  **AWS Lambda (XGBoost Bridge):** Serverless Backend. Recibe la petición, desempaqueta la estructura, y lanza una llamada síncrona a la inferencia vía Boto3 de SageMaker. Una vez obtenida la respuesta del modelo, realiza la tarea de **descompresión escalar** (multiplicando el logaritmo crudo por `124717.0`) restaurando el volumen a unidades reales.
4.  **Amazon SageMaker (Endpoint Inferencia):** Container de Machine Learning de tiempo real alojando el ensamble de XGBoost (`api-xgboost-predicciones-v1`).
5.  **Amazon DynamoDB (Storage/Trazabilidad):** La misma Lambda, antes de responderle al frontend, actúa como productora registrando la operación (UUID, marcas de tiempo asíncrono temporal UTC, tensor exacto y predicción decodificada) para alimentar simuladores posteriores, métricas y el historial en vivo del frontend.

## 2. Justificación Técnica: Migración de LSTM a Ensamble XGBoost

Aunque los modelos LSTM (Long Short-Term Memory) son la elección clásica para series temporales por su capacidad para predecir secuencias basadas en ventanas de tiempo contiguas, encontramos tres limitaciones clave para el contexto logístico transaccional de *Easy Supply*: 
1) Su alta susceptibilidad al ruido estocástico cuando faltan datos estructurados consecutivos. 
2) La tendencia al "colapso de predicciones" (convergencia monótona) en tiempos irregulares sin un ciclo estricto de auto-regresión. 
3) Sus altos requerimientos de latencia y uso de GPU para inferencias pesadas.

El pivote a un modelo de árboles de decisión potenciado por gradiente, **XGBoost (Extreme Gradient Boosting)**, mitiga radicalmente esto. XGBoost destaca al procesar **datos de forma tabular e irregular**, donde variables dispares o booleanas—como `¿Es Quincena?` (0 o 1) o `Precio WTI` (float)—tienen saltos drásticos que no son secuencialmente dependientes minuto a minuto del factor tiempo, sino combinacionalmente dependientes de los tensores. Esto nos garantiza una inferencia con menor latencia en AWS Lambda (ideal para arquitecturas sin servidor), alta escalabilidad ante ráfagas de millones de consultas logísticas por tienda, e inmunidad a ventanas secuenciales omitidas garantizando resultados robustos y dinámicos para el simulador de usuario sin sufrir "underfitting".

---

## 3. Esquema API RESTful para Frontend

Para enlazar el backend con la Interfaz Ciberpunk de React en el Dashboard:

**Método:** `POST`
**Headers de Solicitud:**
- `Content-Type`: `application/json`
- `Authorization`: `<JWT_Token>` (Generado por Amplify AuthSession)

**Estructura Payload Esperada (JSON):**
```json
{
  "tensor": [1, 85.56, 3, 0, 0, 8100, 0, 0.15, 0.18]
}
```

**Estructura de Respuesta Esperada (JSON):**
```json
{
  "mensaje": "Inferencia exitosa",
  "ventas_estimadas": 12845.65,
  "id_operacion": "b8a9..."
}
```

## 4. Código Fuente Desplegable: AWS Lambda (`lambda_function.py`)

A continuación, la lógica de backend nativa en Python usando Boto3 lista para ser empaquetada como `.zip` en AWS Lambda:

```python
import json
import boto3
import os
import uuid
import datetime

# Inicialización de Clientes AWS (Caché global optimizada para cold-starts)
sagemaker = boto3.client('sagemaker-runtime')
dynamodb = boto3.resource('dynamodb')

# Variables de Invocación
ENDPOINT_NAME = os.environ.get('ENDPOINT_NAME', 'api-xgboost-predicciones-v1')
TABLE_NAME = os.environ.get('TABLE_NAME', 'easy-supply-history')
SCALAR_FACTOR = 124717.0

def lambda_handler(event, context):
    try:
        # 1. Configuración de Esquema API y CORS Preflight 
        if event.get('httpMethod') == 'OPTIONS':
            return _build_response(200, "CORS OK")

        # 2. Desempaquetado del Tensor Matemático
        body = json.loads(event.get('body', '{}'))
        tensor = body.get('tensor')
        
        if not isinstance(tensor, list) or len(tensor) != 9:
            return _build_response(400, {'error': 'Sintaxis de tensor estropeada o insuficiente.'})
            
        # SageMaker XGBoost espera, por norma, formato tabular vía CSV sin cabeceras
        csv_payload = ','.join(map(str, tensor))

        # 3. Invocación de Inferencia en SageMaker
        response = sagemaker.invoke_endpoint(
            EndpointName=ENDPOINT_NAME,
            ContentType='text/csv',
            Body=csv_payload
        )
        
        # Extracción y decodificación
        result_str = response['Body'].read().decode('utf-8')
        ml_prediction = float(result_str.strip())
        
        # 4. Descompresión Matemática al Entorno Real
        volumen_proyectado = ml_prediction * SCALAR_FACTOR
        
        # 5. Trazabilidad de BBDD no relacional (DynamoDB)
        table = dynamodb.Table(TABLE_NAME)
        request_id = str(uuid.uuid4())
        
        table.put_item(
            Item={
                'ID_Peticion': request_id, 
                'Fecha': datetime.datetime.utcnow().isoformat(),
                'Tensor_Entrada': json.dumps(tensor), 
                'Resultado_Final': str(volumen_proyectado),
                'Modelo_Usado': 'XGBoost Ensamble v1'
            }
        )
        
        # 6. Retorno de Integración Frontend
        return _build_response(200, {
            'mensaje': 'Inferencia ejecutada exitosamente',
            'ventas_estimadas': round(volumen_proyectado, 2),
            'id_operacion': request_id
        })

    except Exception as e:
        print(f"Server Core Error: {str(e)}")
        return _build_response(500, {'error': 'Falla de cálculo crítico', 'detalle': str(e)})

def _build_response(status_code, body_payload):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body_payload) if isinstance(body_payload, dict) else body_payload
    }

```
