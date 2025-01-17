import type { Meta, StoryObj } from '@storybook/react';
import Servers from '../containers/Server/Servers';

const meta = {
    title: 'Components/Servers',
    component: Servers,
    // parameters: {
    //   layout: 'centered',
    // },
  } satisfies Meta<typeof Servers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
  "servers": {
    "development": {
      "host": "dev-messaging.example.com:{port}",
      "protocol": "mqtt",
      "description": "Development MQTT broker for testing and integration.\n\nThis environment is **not production-ready** and is meant for developers to experiment and integrate their systems with messaging services.",
      "protocolVersion": 5,
      "security": [
        {
          "$ref": "#/components/securitySchemes/developerApiKey"
        }
      ],
      "tags": [
        {
          "name": "development",
          "description": "Development environment for internal testing."
        }
      ],
      "variables": {
        "port": {
          "description": "Secure connection port used for MQTT connections.\n\nUse `8883` for encrypted traffic and `8884` for alternate secure connections.",
          "default": "8883",
          "enum": [
            "8883",
            "8884"
          ],
          "examples": ["8883", "8884"]
        }
      }
    },
    "testing": {
      "host": "test-messaging.example.com:{port}/{region}",
      "protocol": "mqtt",
      "description": "Testing/Staging MQTT broker for pre-production testing.\n\nThis environment closely mirrors the production setup but may experience interruptions during QA cycles.",
      "protocolVersion": 5,
      "security": [
        {
          "$ref": "#/components/securitySchemes/testApiKey"
        }
      ],
      "tags": [
        {
          "name": "testing",
          "description": "Testing/QA environment for pre-production validation."
        }
      ],
      "variables": {
        "port": {
          "description": "Secure connection port used for staging MQTT traffic.\n\nSupports encryption over the listed ports.",
          "default": "8883",
          "examples": ["8883"]
        },
        "region": {
          "description": "Server region to connect to for testing purposes.\n\nExamples include regions like `us-east-1` for US East and `eu-west-1` for EU West.",
          "default": "us-east-1",
          "enum": [
            "us-east-1",
            "eu-west-1"
          ],
          "examples": ["us-east-1", "eu-west-1"]
        }
      }
    },
    "production": {
      "host": "messaging.example.com",
      "protocol": "mqtt",
      "description": "Production MQTT broker with high availability and scalability.\n\nThis environment is fully monitored and includes redundant failovers to ensure minimal downtime. Ideal for mission-critical applications.",
      "protocolVersion": 5,
      "security": [
        {
          "$ref": "#/components/securitySchemes/prodApiKey"
        }
      ],
      "tags": [
        {
          "name": "production",
          "description": "Production environment with full support."
        }
      ],
      "variables": {
        "port": {
          "description": "Secure connection port used for production MQTT traffic.\n\nThe default port `8883` is recommended for most use cases.",
          "default": "8883",
          "examples": ["8883"]
        },
        "region": {
          "description": "Region of the server to connect to.\n\nThis allows for better latency and reliability depending on the geographical location.",
          "default": "us-east-1",
          "enum": [
            "us-east-1",
            "eu-west-1",
            "ap-southeast-1"
          ],
          "examples": ["us-east-1", "eu-west-1", "ap-southeast-1"]
        }
      },
      "bindings": {
        "mqtt": {
          "clientId": {
            "type": "string",
            "pattern": "prod-[a-z0-9]+",
            "description": "The MQTT client identifier. Must start with `prod-` followed by alphanumeric characters.",
            "examples": ["prod-123abc", "prod-456xyz"]
          },
          "keepAlive": 60,
          "cleanSession": true,
          "lastWill": {
            "topic": "clients/{clientId}/status",
            "qos": 1,
            "retain": true,
            "message": "offline",
            "description": "Last will message sent when the client disconnects unexpectedly."
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "developerApiKey": {
        "type": "apiKey",
        "in": "user",
        "description": "Developer API key for the development environment. Use this key only for internal testing."
      },
      "testApiKey": {
        "type": "apiKey",
        "in": "user",
        "description": "Test API key for the testing environment. Ensure you do not use it in production."
      },
      "prodApiKey": {
        "type": "apiKey",
        "in": "user",
        "description": "Production API key with rate limiting and enhanced security. Keep this key secure."
      }
    }
  }
}
}
