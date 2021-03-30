/*
 * Project Aquarium's frontend (glass)
 * Copyright (C) 2021 SUSE, LLC.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface HealthCheckSummary {
  message: string;
  count: number;
}

export interface HealthStatus {
  status: string;
  checks: { [id: string]: HealthCheckSummary };
}

export interface ClusterStatus {
  fsid: string;
  /* eslint-disable @typescript-eslint/naming-convention */
  election_epoch: number;
  quorum: number[];
  quorum_names: string[];
  quorum_age: number;
  health: HealthStatus;
}

export type Status = {
  cluster?: ClusterStatus;
};

export type IORate = {
  read: number;
  write: number;
  read_ops: number;
  write_ops: number;
};

export type ServiceIO = {
  service_name: string;
  service_type: string;
  io_rate: IORate;
};

export type ClientIO = {
  cluster: IORate;
  services: ServiceIO[];
};

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private url = 'api/status';

  constructor(private http: HttpClient) {}

  /**
   * Get the current status.
   */
  status(): Observable<Status> {
    return this.http.get<Status>(`${this.url}/`);
  }

  clientIO(): Observable<ClientIO> {
    //return this.http.get<Status>(`${this.url}/client-io-rates`);
    const sIOs: ServiceIO[] = [
      this.mockServiceIo('one', 'CephFs'),
      this.mockServiceIo('two', 'iSCSI'),
      this.mockServiceIo('three', 'NFS')
    ];
    // @ts-ignore
    const mapAndReduce = (attr: string) =>
      // @ts-ignore
      sIOs.map((s) => s.io_rate[attr]).reduce((prev, cur) => prev + cur);

    return of({
      cluster: {
        read: mapAndReduce('read'),
        write: mapAndReduce('write'),
        read_ops: mapAndReduce('read_ops'),
        write_ops: mapAndReduce('write_ops')
      },
      services: sIOs
    });
  }

  private mockServiceIo(name: string, type: string): ServiceIO {
    const randVal = (): number => 1024 ** 3 * Math.random();
    return {
      service_name: name,
      service_type: type,
      io_rate: {
        read: randVal(),
        write: randVal(),
        read_ops: randVal(),
        write_ops: randVal()
      }
    };
  }
}
