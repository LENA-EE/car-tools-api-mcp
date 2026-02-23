/**
 * Tool Definitions
 * OpenAI function calling compatible format
 */

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_cars',
      description: 'Поиск автомобилей в каталоге по параметрам. Используй для конкретных запросов типа "BMW X5 дизель до 3 млн"',
      parameters: {
        type: 'object',
        properties: {
          mark_name: {
            type: 'string',
            description: 'Марка автомобиля (BMW, Toyota, Mercedes-Benz и т.д.)',
          },
          folder_name: {
            type: 'string',
            description: 'Модель автомобиля (X5, RAV4, E-Class)',
          },
          body_type: {
            type: 'string',
            description: 'Тип кузова (седан, кроссовер, хэтчбек, универсал, внедорожник)',
          },
          engine_type: {
            type: 'string',
            enum: ['diesel', 'petrol', 'hybrid', 'electric'],
            description: 'Тип двигателя',
          },
          transmission: {
            type: 'string',
            enum: ['AT', 'MT', 'CVT', 'AMT'],
            description: 'Тип коробки передач (AT=автомат, MT=механика)',
          },
          drive_type: {
            type: 'string',
            enum: ['4WD', 'FWD', 'RWD'],
            description: 'Тип привода (4WD=полный, FWD=передний, RWD=задний)',
          },
          price_min: {
            type: 'number',
            description: 'Минимальная цена в рублях',
          },
          price_max: {
            type: 'number',
            description: 'Максимальная цена в рублях',
          },
          year_from: {
            type: 'integer',
            description: 'Год выпуска от',
          },
          year_to: {
            type: 'integer',
            description: 'Год выпуска до',
          },
          limit: {
            type: 'integer',
            description: 'Количество результатов (default: 5)',
            default: 5,
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_vin',
      description: 'Полная проверка автомобиля по VIN: расшифровка + проверка залогов, ДТП, розыска. Используй когда пользователь просит "проверить VIN" или даёт 17-значный код',
      parameters: {
        type: 'object',
        properties: {
          vin: {
            type: 'string',
            description: 'VIN номер автомобиля (17 символов)',
          },
        },
        required: ['vin'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'decode_vin',
      description: 'Только расшифровка VIN (марка, модель, год, страна). Без проверки истории. Используй когда нужна только базовая информация о VIN',
      parameters: {
        type: 'object',
        properties: {
          vin: {
            type: 'string',
            description: 'VIN номер автомобиля (17 символов)',
          },
        },
        required: ['vin'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'semantic_search',
      description: 'Семантический поиск по описанию. Используй для абстрактных запросов типа "надёжная семейная машина", "экономичный городской автомобиль"',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Описание желаемого автомобиля на естественном языке',
          },
          limit: {
            type: 'integer',
            description: 'Количество результатов (default: 5)',
            default: 5,
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_model_info',
      description: 'Информация о модели автомобиля: типичные болячки, стоимость обслуживания, особенности. Используй свои знания для ответа',
      parameters: {
        type: 'object',
        properties: {
          brand: {
            type: 'string',
            description: 'Марка автомобиля',
          },
          model: {
            type: 'string',
            description: 'Модель автомобиля',
          },
          year_from: {
            type: 'integer',
            description: 'Начало поколения (год)',
          },
          year_to: {
            type: 'integer',
            description: 'Конец поколения (год)',
          },
        },
        required: ['brand', 'model'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_models',
      description: 'Сравнение двух моделей автомобилей. Используй свои знания для детального сравнения',
      parameters: {
        type: 'object',
        properties: {
          model1: {
            type: 'object',
            properties: {
              brand: { type: 'string' },
              model: { type: 'string' },
            },
            required: ['brand', 'model'],
          },
          model2: {
            type: 'object',
            properties: {
              brand: { type: 'string' },
              model: { type: 'string' },
            },
            required: ['brand', 'model'],
          },
        },
        required: ['model1', 'model2'],
      },
    },
  },
];

module.exports = { TOOLS };
