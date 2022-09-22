/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */

import {
  AuthenticationHandler,
  Client,
  Context,
  HTTPMessageHandler,
  Middleware,
  RetryHandler,
  RetryHandlerOptions,
  TelemetryHandler
} from '@microsoft/microsoft-graph-client';
import { MgtBaseComponent } from '@microsoft/mgt-element';
import { Graph } from '@microsoft/mgt-element';
import { chainMiddleware } from '@microsoft/mgt-element';
import { MockProvider } from './MockProvider';

/**
 * MockGraph Instance
 *
 * @export
 * @class MockGraph
 * @extends {Graph}
 */
// tslint:disable-next-line: max-classes-per-file
export class MockGraph extends Graph {
  /**
   * Creates a new MockGraph instance. Use this static method instead of the constructor.
   *
   * @static
   * @param {MockProvider} provider
   * @return {*}  {Promise<MockGraph>}
   * @memberof MockGraph
   */
  public static async create(provider: MockProvider): Promise<MockGraph> {
    const middleware: Middleware[] = [
      new AuthenticationHandler(provider),
      new RetryHandler(new RetryHandlerOptions()),
      new TelemetryHandler(),
      new MockMiddleware(),
      new HTTPMessageHandler()
    ];

    return new MockGraph(
      Client.initWithMiddleware({
        middleware: chainMiddleware(...middleware),
        customHosts: new Set<string>([new URL(await MockMiddleware.getBaseUrl()).hostname])
      })
    );
  }

  /**
   * Returns an instance of the Graph in the context of the provided component.
   *
   * @param {MgtBaseComponent} component
   * @returns
   * @memberof Graph
   */
  public forComponent(component: MgtBaseComponent): MockGraph {
    // The purpose of the forComponent pattern is to update the headers of any outgoing Graph requests.
    // The MockGraph isn't making real Graph requests, so we can simply no-op and return the same instance.
    return this;
  }
}

/**
 * Implements Middleware for the Mock Client to escape
 * the graph url from the request
 *
 * @class MockMiddleware
 * @implements {Middleware}
 */
// tslint:disable-next-line: max-classes-per-file
class MockMiddleware implements Middleware {
  /**
   * @private
   * A member to hold next middleware in the middleware chain
   */
  private _nextMiddleware: Middleware;

  private static _baseUrl;

  // tslint:disable-next-line: completed-docs
  public async execute(context: Context): Promise<void> {
    try {
      const baseUrl = await MockMiddleware.getBaseUrl();
      context.request = baseUrl + escape(context.request as string);
    } catch (error) {
      // ignore error
    }
    return await this._nextMiddleware.execute(context);
  }
  /**
   * Handles setting of next middleware
   *
   * @param {Middleware} next
   * @memberof SdkVersionMiddleware
   */
  public setNext(next: Middleware): void {
    this._nextMiddleware = next;
  }

  public static async getBaseUrl() {
    if (!this._baseUrl) {
      try {
        // get the url we should be using from the endpoint service
        const response = await fetch('https://cdn.graph.office.net/en-us/graph/api/proxy/endpoint');
        this._baseUrl = (await response.json()) + '?url=';
      } catch {
        // fallback to hardcoded value
        this._baseUrl = 'https://proxy.apisandbox.msdn.microsoft.com/svc?url=';
      }
    }

    return this._baseUrl;
  }
}
