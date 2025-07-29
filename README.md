
Contrato de licitación (mensaje)

``` typescript
interface Message {
    id: string;
    status: "pre-processed" | "processed" | "discarded";
    createdAt: Date;

    payload: {
        code: string;
        title: string;
        description: string;
    };
}

export default Message;
```

```json
{
    "id": "1",
    "status": "pre-processed",
    "createdAt": "2021-01-01",
    "payload": {
        "code": "____-__-",
        "title": "Hello, world!",
        "description": "This is a test message",
    }
}
```