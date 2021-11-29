<template>
  <div>
      <v-app>
          <!-- header -->
          <v-app-bar color="black" dark app>
              <v-icon class="mr-2" x-large>mdi-book-open-page-variant</v-icon>
              <v-app-bar-title class="text-h4 text-no-wrap pt-2">Ripetizioni</v-app-bar-title>
              <v-spacer></v-spacer>
              <v-menu dark offset-y>
                <template v-slot:activator="{on,attrs}">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-hexagon</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item link dense @click="addPersona.visible=true">
                    <v-list-item-title>Aggiungi</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
          </v-app-bar>
          <!-- main -->
          <v-main class="ma-9">
            <v-row>
              <v-col 
                v-for="ragazzo in ragazzi"
                :key="ragazzo.id"
                cols=12
                md=auto
              >
                <v-card 
                  outlined color="amber darken-1 rounded-lg"
                  @click="openDialog('viewIncontri', ragazzo.nome, ragazzo.cognome, ragazzo.id)"
                >
                  <v-card-title 
                    class="text-h5 font-weight-medium"
                  >
                  {{ragazzo.nome}} {{ragazzo.cognome}}
                  </v-card-title>
                  <v-card-text>
                    <v-chip class="mr-3" color="red" text-color="white">
                      <span v-if="conti.totaleDovuto[ragazzo.id]">{{conti.totaleDovuto[ragazzo.id]}}</span>
                      <span v-else>0</span>
                    </v-chip>
                    <v-chip color="green" text-color="white">
                      <span v-if="conti.totaleSaldato[ragazzo.id]">{{conti.totaleSaldato[ragazzo.id]}}</span>
                      <span v-else>0</span>
                    </v-chip>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <!-- Aggiungi ragazzo -->
            <v-dialog 
              v-model="addPersona.visible"
              transition="fab-transition"
              persistent
            > 
              <v-card width=300px flat>
                <v-card-title class="mb-3">
                  Aggiungi ragazzo
                  <v-spacer></v-spacer>
                  <v-btn icon @click="addPersona.visible=false"><v-icon>mdi-close</v-icon></v-btn>
                </v-card-title>
                <v-card-text class="">
                    <v-form ref="addPersona" @submit.prevent="submit('addPersona')">
                     <v-text-field
                       label="Nome"
                       required
                       outlined
                       v-model="addPersona.body.nome"
                       :rules="addPersona.rules.nome"
                     ></v-text-field>
                     <v-text-field
                       label="Cognome"
                       required
                       outlined
                       v-model="addPersona.body.cognome"
                       :rules="addPersona.rules.cognome"
                     ></v-text-field>
                     <v-text-field
                       label="Indirizzo"
                       required
                       outlined
                       v-model="addPersona.body.indirizzo"
                       :rules="addPersona.rules.indirizzo"
                     ></v-text-field>
                     <v-row class="mb-1">
                       <v-spacer></v-spacer>
                       <v-btn 
                         class="mr-3 mt-3"
                         color="amber darken-1 rounded-lg"
                         type="submit"
                       >
                         Aggiungi
                       </v-btn>
                     </v-row>
                    </v-form>
                </v-card-text>
              </v-card>
            </v-dialog>
            <!-- Visualizza incontri ragazzo -->
            <v-dialog
              v-model="viewIncontri.visible"
              transition="fab-transition"
              persistent
            >
              <v-card flat>
                <v-card-title>
                  {{ viewIncontri.nomeRagazzo }}
                  <v-spacer></v-spacer>
                  <v-btn icon @click="viewIncontri.visible=false"><v-icon>mdi-close</v-icon></v-btn>
                </v-card-title>
                <v-card-text>
                    Totale ore:
                    <v-chip color="amber darken-1" class="mr-2">
                        {{ hourFormatter(totOreIncontri()) }}
                    </v-chip>
                    Totale: 
                    <v-chip color="amber darken-1">
                      {{ conti.totaleDovuto[viewIncontri.ragazzo]+conti.totaleSaldato[viewIncontri.ragazzo] }}€
                    </v-chip>
                  <v-data-table
                    class="mt-1"
                    :headers="[
                      {text: 'Data', value: 'data'},
                      {text: 'Ore', value: 'ore'},
                      {text: 'Ok', value: 'saldato', width: '17%'},
                      {text: 'Materia', value: 'materia', width: '18%'}
                    ]"
                    :items="viewIncontri.incontri"
                    calculate-widths
                    sort-by="data"
                    sort-desc
                    mobile-breakpoint="0"
                    @click:row="(e,i)=>openDialog('editIncontro',e,i)"
                    :footer-props="{
                      itemsPerPageText: 'Righe per pagina',
                      itemsPerPageAllText: 'Tutti',
                      pageText: '',
                      showCurrentPage: true,
                      showFirstLastPage: true
                    }"
                  >
                    <!-- eslint-disable-next-line -->
                    <template v-slot:item.data="{ item }">
                      {{ dataInverter(item.data) }}
                    </template>
                    <!-- eslint-disable-next-line -->
                    <template v-slot:item.ore="{ item }">
                      {{ hourFormatter(item.ore) }}
                    </template>
                    <!-- eslint-disable-next-line -->
                    <template v-slot:item.saldato="{ item }">
                      <v-simple-checkbox
                        :value="item.saldato==0 ? false:true"
                        disabled
                      >
                    </v-simple-checkbox>
                  </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-dialog>
            <!-- Modifica incontro -->
            <v-dialog
              v-model="editIncontro.visible"
              transition="fab-transition"
              
            >
              <v-card>
                <v-card-title>Modifica incontro</v-card-title>
                <v-card-text>
                  <v-menu
                    v-model="editIncontro.dateMenu"
                    offset-y
                  >
                    <template v-slot:activator="{on, attrs}">
                      <v-text-field
                        label="Data"
                        :value="dataInverter(editIncontro.body.data)"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      >
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="editIncontro.body.data"
                      @input="editIncontro.dateMenu = false"
                      no-title
                      locale="IT"
                      color="#f08800"
                    >
                    </v-date-picker>
                  </v-menu>
                  <v-row class="preventZoom pt-2">
                    <v-btn 
                      text 
                      fab 
                      small
                      color="#d67900"
                      :disabled="editIncontro.body.ore<0.25" 
                      class="mr-2 mt-1" 
                      @click="editIncontro.body.ore-=0.25"
                    >
                      <v-icon>mdi-minus-box</v-icon>
                    </v-btn>
                    <v-text-field
                      label="Ore"
                      :value="hourFormatter(editIncontro.body.ore)"
                    >
                    </v-text-field>
                    <v-btn 
                      text 
                      fab 
                      small
                      class="mr-2 mt-1"
                      color="#d67900"
                      @click="editIncontro.body.ore+=0.25"
                    >
                      <v-icon text>mdi-plus-box</v-icon>
                    </v-btn>
                  </v-row>
                  <v-row class="mt-0">
                    <v-col cols="8">
                      <v-select
                        label="Materia"
                        :items="editIncontro.materie"
                        v-model="editIncontro.body.materia"
                      >
                      </v-select>
                    </v-col>
                    <v-col cols="4">
                      <v-checkbox
                        label="Ok"
                        v-model="editIncontro.body.saldato"
                      >
                      </v-checkbox>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-main>
      </v-app>
  </div>
</template>

<script>

import axios from 'axios';

export default {
  name: 'HelloWorld',
  data(){
    return {
      addPersona: {
        visible: false,
        validate: false,
        body: {
          nome:'',
          cognome:'',
          indirizzo:''
        },
        rules: {
          nome:      [ x => !x=="" || "Nome non valido" ],
          cognome:   [ x => !x=="" || "Cognome non valido" ],
          indirizzo: [ x => /[A-z]*,[\s\S]*\d/.test(x) || "Indirizzo non valido (es. Milano, via Gino 3)" ]
        }
      },
      viewIncontri : {
        visible: false,
        ragazzo: 0,
        nomeRagazzo: "",
        incontri: []
      },
      editIncontro: {
        visible: false,
        dateMenu: false,
        materie: [],
        body: {}
      },
      ragazzi: [],
      conti: {
        totaleDovuto: {},
        totaleSaldato: {},
      }
    }
  },
  mounted() {
    this.selectFromDb('Ragazzo').then(res => this.setRagazzi(res));
    this.getConti().then(res => this.setConti(res));
  },
  props: {},
  methods: {
    selectFromDb (table) {
      return axios.post(
        "http://"+this.$backendAddr+":4000/selectDb",
        {'table': table}
      ).then( function(response) {
        return response.data
      });
    },

    insertIntoDb (table, data, next) {
      axios.post(
        "http://"+this.$backendAddr+":4000/insertDb",
        {
          'table': table,
          'data': data
        }
      ).then( function(res) {
        //console.log(res);
        next(res);
      }).catch( function(err) {
        console.log(err);
        throw err;
      });
    },

    setRagazzi (data) { this.ragazzi=data },
    setConti (data) { this.conti=data },
    setIncontri (data) { Promise.all(this.viewIncontri.incontri=data).then( res => this.viewIncontri.incontri=res )},
     
    // 2021-12-16 -> 16-12-2021
    dataInverter (data) {
      let x = data.split('-').reverse();
      return x[0].concat('-', x[1], '-', x[2]);
    },

    hourFormatter (h) {
      if (Number.isInteger(h)) { return `${h.toString()}h`}
      else { 
        if (Number.isInteger(h-0.25)) { // e un quarto
          return `${parseInt(h)}h 15'`
        }  
        if (Number.isInteger(h-0.5)) { // e mezza
          return `${parseInt(h)}h 30'`
        }
        if (Number.isInteger(h-0.75)) { // e 45m
          return `${parseInt(h)}h 45'`
        }
      }
    },

    getConti () {
      return axios.post(
        "http://"+this.$backendAddr+":4000/query",
        {
          'query': "WITH saldati AS (SELECT T.ragazzo, SUM(I.ore*T.prezzo) as totSaldato FROM Incontro as I LEFT JOIN Tariffa as T ON T.id=I.tariffa WHERE I.saldato=1 GROUP BY T.ragazzo) SELECT T2.ragazzo, SUM(I2.ore*T2.prezzo) as totale, S2.totSaldato as totaleSaldato FROM Incontro AS I2 LEFT JOIN Tariffa as T2 ON T2.id=I2.tariffa LEFT JOIN saldati as S2 ON S2.ragazzo=T2.ragazzo GROUP BY T2.ragazzo;"
        }
      ).then( function(res) {
        let dictonary = {
          'totaleSaldato': {},
          'totaleDovuto': {}
        };
        for (let x in res.data) {
          let key = res.data[x]['ragazzo']
          dictonary['totaleSaldato'][key] = res.data[x]['totaleSaldato']
          dictonary['totaleDovuto'][key] = res.data[x]['totale'] - res.data[x]['totaleSaldato']
        }
        return dictonary;
      });
    },

    getIncontri (ragazzo) {
      return axios.post(
        "http://"+this.$backendAddr+":4000/query",
        {'query': `SELECT I.id, I.data, T.materia, I.ore, I.saldato FROM Incontro AS I JOIN Tariffa AS T ON T.id=I.tariffa WHERE T.ragazzo=${ragazzo};`}
      ).then( res => {
        return res.data
      } );
    },

    getMaterie (ragazzo) {
      return axios.post(
        "http://"+this.$backendAddr+":4000/query",
        {'query': `SELECT materia FROM Tariffa WHERE ragazzo=${ragazzo};`}
      ).then( res => {
        let tot = [];
        for (let i in res.data) {
          tot.push(res.data[i].materia)
        }
        return tot;
      }
      );
    },

    totOreIncontri () {
      let tot = 0;
      for (let i in this.viewIncontri.incontri) {
        tot += this.viewIncontri.incontri[i].ore
      }
      return tot;
    },

    openDialog (dialog, ...args) {
      switch (dialog) {
        case 'viewIncontri': //['viewIncontri', nome, cognome, id]
          this.viewIncontri.visible=true, 
          this.viewIncontri.nomeRagazzo=args[0]+' '+args[1],
          this.viewIncontri.ragazzo= args[2],
          this.getIncontri(args[2]).then(res => this.viewIncontri.incontri=res)
          break;
        case 'editIncontro': //['editIncontro', event, item]
          this.editIncontro.visible = true,
          this.editIncontro.body = args[1].item
          this.getMaterie(this.viewIncontri.ragazzo).then(res => this.editIncontro.materie=res)
          break;
      }
    },

    submit (ref) {
      let self = this;
      switch(ref){
        case "addPersona":
          if (this.$refs.addPersona.validate()) {
            this.insertIntoDb('Ragazzo', this.addPersona.body, function(res) {
              self.addPersona.visible = false;
              self.ragazzi = res['data'];
            })
          } else {
            console.log("Dati errati")
          }
          break;
      }
    }
  }
}
</script>

<style scoped>

.preventZoom {
  touch-action: manipulation;
}

</style>
