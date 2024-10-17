import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ScannerQRCodeConfig, NgxScannerQrcodeService, ScannerQRCodeSelectedFiles, ScannerQRCodeResult, NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';

import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { Result } from '@zxing/library';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#front_and_back_camera
  public config: ScannerQRCodeConfig = {
    constraints: {
      video: {
        width: window.innerWidth
      },
    },
    // canvasStyles: [
    //   {
    //     lineWidth: 1,
    //     fillStyle: '#00950685',
    //     strokeStyle: '#00950685',
    //   },
    //   {
    //     font: '17px serif',
    //     fillStyle: '#ff0000',
    //     strokeStyle: '#ff0000',
    //   }
    // ],
  };

  public qrCodeResult: ScannerQRCodeSelectedFiles[] = [];
  public qrCodeResult2: ScannerQRCodeSelectedFiles[] = [];
  public percentage = 80;
  public quality = 100;

  @ViewChild('action') action!: NgxScannerQrcodeComponent;

  constructor(private qrcode: NgxScannerQrcodeService, private http: HttpClient) { }


  code: any
  listOfBarcode: any = []
  reading: boolean = false
  public onEvent(e: ScannerQRCodeResult[], action?: any): void {
    // e && action && action.pause();
    // console.log(e);

    if (this.reading == false) {
      this.code = e[0].value;

      this.listOfBarcode.filter((item: any) => item.barcode == e[0].value)[0] ? this.listOfBarcode.filter((item: any) => item.barcode == e[0].value)[0].quantity++ :
        this.listOfBarcode.push({ barcode: e[0].value, quantity: 1 });
      this.reading = true
      this.handle(this.action, 'pause')
      setTimeout(() => {
        this.reading = false;
        this.code = '';
        this.handle(this.action, 'play')
      }, 2000);
    }
  }

  public handle(action: any, fn: string): void {
    // Fix issue #27, #29
    const playDeviceFacingBack = (devices: any[]) => {
      // front camera or back camera check here!
      const device = devices.find(f => (/back|rear|environment/gi.test(f.label))); // Default Back Facing Camera
      action.playDevice(device ? device.deviceId : devices[0].deviceId);
    }

    if (fn === 'start') {
      action[fn](playDeviceFacingBack).subscribe((r: any) => console.log(fn, r), alert);
    } else {
      action[fn]().subscribe((r: any) => console.log(fn, r), alert);
    }
  }

  public onDowload(action: NgxScannerQrcodeComponent) {
    action.download().subscribe(console.log, alert);
  }

  public onSelects(files: any) {
    this.qrcode.loadFiles(files, this.percentage, this.quality).subscribe((res: ScannerQRCodeSelectedFiles[]) => {
      this.qrCodeResult = res;
    });
  }

  public onSelects2(files: any) {
    this.qrcode.loadFilesToScan(files, this.config, this.percentage, this.quality).subscribe((res: ScannerQRCodeSelectedFiles[]) => {
      console.log(res);
      this.qrCodeResult2 = res;
    });
  }

  public onGetConstraints() {
    const constrains = this.action.getConstraints();
    console.log(constrains);
  }

  public applyConstraints() {
    const constrains = this.action.applyConstraints({
      ...this.action.getConstraints(),
      width: 510
    });
    console.log(constrains);
  }





  @ViewChild('scanner') scanner!: ZXingScannerComponent;
  formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX];
  hasDevices: boolean = false;
  hasPermission: boolean = false;
  qrResultString: string = '';
  qrResult: Result | undefined;
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined;






  onDownload() {
    const fileName = 'barcodes.json'; // Set the desired file name

    // Convert the array to a JSON string
    const fileContent = JSON.stringify(this.listOfBarcode, null, 2); // Pretty print with 2 spaces

    // Create a Blob from the JSON string
    const blob = new Blob([fileContent], { type: 'application/json' });

    // Save the file
    this.saveFile(blob, fileName);
  }

  private saveFile(blob: Blob, filename: string) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }







  ngAfterViewInit(): void {
    this.action.isReady.subscribe((res: any) => {
      // this.handle(this.action, 'start');
    });




    // this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
    //   this.hasDevices = true;
    //   this.availableDevices = devices;

    //   // Optionally select the back camera by default
    //   // for (const device of devices) {
    //   //   if (/back|rear|environment/gi.test(device.label)) {
    //   //     this.scanner.changeDevice(device);
    //   //     this.currentDevice = device;
    //   //     break;
    //   //   }
    //   // }
    // });

    // this.scanner.camerasNotFound.subscribe(() => this.hasDevices = false);
    // this.scanner.scanComplete.subscribe((result: Result) => this.qrResult = result);
    // this.scanner.permissionResponse.subscribe((perm: boolean) => {
    //   this.hasPermission = perm;
    //   if (!perm) {
    //     this.requestPermission();
    //   }
    // });

    // // Request initial permission
    // this.requestPermission();
  }

  // displayCameras(cameras: MediaDeviceInfo[]) {
  //   console.debug('Devices: ', cameras);
  //   this.availableDevices = cameras;
  // }
  // listOfBarcode: any = []
  // reading: boolean = false
  // handleQrCodeResult(resultString: string) {
  //   if (this.reading == false) {
  //     this.qrResultString = resultString;
  //     this.listOfBarcode.push({ barcode: resultString, quantity: 1 });
  //     this.reading = true
  //     setTimeout(() => {
  //       this.reading = false;
  //       this.qrResultString = '';
  //     }, 2000);
  //   }
  // }

  // onDeviceSelectChange(event: Event) {
  //   const deviceId = (event.target as HTMLSelectElement).value;
  //   const selectedDevice = this.availableDevices.find(device => device.deviceId === deviceId);
  //   this.currentDevice = selectedDevice;
  // }

  // requestPermission() {
  //   navigator.mediaDevices.getUserMedia({ video: true })
  //     .then((stream) => {
  //       this.hasPermission = true;
  //       stream.getTracks().forEach(track => track.stop()); // Stop the stream to release the camera
  //     })
  //     .catch((err) => {
  //       console.error('Permission denied:', err);
  //       this.hasPermission = false;
  //     });
  // }

  // stateToEmoji(state: boolean | undefined | null): string {
  //   const states: { [key: string]: string } = {
  //     'undefined': '❔',
  //     'null': '⭕',
  //     'true': '✔',
  //     'false': '❌'
  //   };

  //   return states[String(state)];
  // }

}
