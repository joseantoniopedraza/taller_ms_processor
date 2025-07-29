
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
        region: string;
    };
}

export default Message;
```

