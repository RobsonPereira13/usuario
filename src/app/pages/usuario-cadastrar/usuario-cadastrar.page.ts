import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-usuario-cadastrar',
  templateUrl: './usuario-cadastrar.page.html',
  styleUrls: ['./usuario-cadastrar.page.scss'],
})
export class UsuarioCadastrarPage implements OnInit {

  private loading: any;
  private user: User = {};
  public form : NgForm;
  
  public usuarioCadastrarForm: FormGroup;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    public loadingController: LoadingController,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private afa: AngularFireAuth,
    private afs: AngularFirestore,
    public alertController: AlertController
   
  ) {
    this.usuarioCadastrarForm = this.formBuilder.group({
      'nome': [null, Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30) 
      ])],
      'email':  [null, Validators.compose([
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$') 
      ])],
      'password': [null, Validators.compose([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12) 
      ])],
      'telefone': [null, Validators.compose([
        Validators.required, 
        // Validators.pattern('^\\([0-9]{2}\\)((3[0-9]{3}-[0-9]{4})|(9[0-9]{3}-[0-9]{5}))$')
      ])]
    })
   }

  ngOnInit() {
    
  }
  
  ngOnDestroy() {
    this.limpar();
  }

  async register(){
    await this.presentLoading();
    try
    {
  const newUser = await this.authService.register(this.user);
  // console.log("Usuario cadastrado com sucesso")
  this.user.foto = "";
  await this.afs.collection('Usuarios').doc(newUser.user.uid).set(this.user);
  // console.log("Dados adicionais salvos com sucesso")
  
    }catch (error) {
      console.error(error);
      let message: string;
      switch(error.code){
        case 'auth/email-already-in-use':
          message = 'e-mail já cadastrado';
          break;
          case 'auth/invalid-email':
              message = 'informe um e-mail valido';
              break;
              case 'auth/argument-error':
                message = 'informe um e-mail';
                break;
              
      }
      // this.presentToast(message);
      this.presentAlert(message);
  }finally {
    this.logar();
    this.loading.dismiss();
    
  }
}

async logar(){
  try {
    await this.authService.login(this.user);
  } catch (error) {
    this.presentToast(error.message);
  }
}  

  limpar() {
    this.usuarioCadastrarForm.reset();
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    return this.loading.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000 });
    toast.present();
  }

  async presentAlert(mensage) {
    const alert = await this.alertController.create({
      header: 'Erro ao logar',
      // subHeader: 'Subtitle',
      message: mensage,
      buttons: ['OK']
    });

    await alert.present();
  }

}
