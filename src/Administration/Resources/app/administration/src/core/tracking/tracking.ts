/**
 * @sw-package framework
 */
type EventName = {
    application: string,
    domain: string;
    action: string,
}

type TrackingContext = {
    screen: {
        width: number;
        height: number;
    };
    userAgent: string;
    shopwareVersion: string;
    timestamp: number;
};

interface TrackingEvent {
    type: 'tracking:event' | 'tracking:page' | 'tracking:identify';
    context: TrackingContext;
    userId: string;
}

interface RegisterTransportMessage extends MessageEvent<{
    _type: 'tracking:register-transport';
}> {
    ports: [MessagePort];
}

/**
 * @private
 */
export default class Tracking {
    private transports: Map<string,MessagePort>;

    public constructor() {
        this.transports = new Map<string, MessagePort>();

        globalThis.addEventListener('message', (message: MessageEvent<unknown>) => {
            if(this.isRegisterTransportMessage(message)) {
                this.registerTransport(message);
            }
        });
    }

    public page(url: string, name: string, pageData: unknown): void {
        this.broadcastEvent({
            type: 'tracking:page',
            url,
            name,
            pageData,
            context: this.context,
            userId: this.userId,
        });
    }

    public track(name: string | EventName, eventData: object) {
        const eventName = typeof name === 'string' ? name : `${name.application}:${name.domain}:${name.action}`;

        this.broadcastEvent({
            type: 'tracking:event',
            name: eventName,
            eventData,
            context: this.context,
            userId: this.userId,
        });
    }

    private identify(transport: MessagePort): void {
        this.sendEvent(transport, {
            type: 'tracking:identify',
            context: this.context,
            userId: this.userId,
        })
    }

    private isRegisterTransportMessage(message: MessageEvent<unknown>): message is RegisterTransportMessage {
        return typeof message.data === 'object'
            && message.data !== null
            && '_type' in message.data
            && message.data._type === 'tracking:register-transport';
    }

    private registerTransport(message: RegisterTransportMessage): void {
        const transport = message.ports[0];

        this.transports.set(message.origin, transport);

        this.identify(transport);
    }

    broadcastEvent<E extends TrackingEvent>(event: E): void {
        this.transports.forEach((transport) => {
            try { this.sendEvent(transport, event) } catch { /* ignore failed messages */ }
        })
    }

    sendEvent(transport: MessagePort, event: TrackingEvent): void {
        transport.postMessage(event);
    }

    private get context(): TrackingContext {
        return {
            screen: {
                width: globalThis.screen?.width,
                height: globalThis.screen?.height,
            },
            userAgent: globalThis.navigator?.userAgent,
            shopwareVersion: Shopware.Context.app.config.version ?? '',
            timestamp: Date.now(),
        }
    }

    private get userId(): string {
        return Shopware.Store.get('session').currentUser?.id ?? '';
    }
}