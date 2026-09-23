import React,{useState} from 'react';
import usePersistentState from '../usePersistentState';
import {View,Text,TextInput,Pressable,ScrollView,StyleSheet,Image} from 'react-native';
import {Feather} from '@expo/vector-icons';
const ink='#1E2D40',muted='#75828C',sage='#668D76';
const seed=[
 {title:'Идеи на будущее',body:'• Больше путешествий\n• Выучить испанский\n• Свой проект\n• Жить осознанно',tag:'Идеи',date:'12 апр.',color:'#FFFCF8'},
 {title:'Места, где я хочу побывать',body:'Горы, озёра и тихие города',tag:'Мечты',date:'10 апр.',color:'#EDF3F8',picture:true},
 {title:'Книги',body:'□ Атомные привычки\n□ Глубокая работа\n□ Искусство жить',tag:'Чтение',date:'9 апр.',color:'#FFF9F6'},
 {title:'План тренировок',body:'• Разминка 10 мин\n• Силовые упражнения\n• Растяжка',tag:'Личное',date:'8 апр.',color:'#FBE9EB'},
 {title:'Планы на весну',body:'• Разобрать квартиру\n• Обновить гардероб\n• Больше времени на себя',tag:'Личное',date:'6 апр.',color:'#FFFCF8'},
 {title:'Заметки о вдохновении',body:'Тихое утро. Чай. Новые идеи.',tag:'Разное',date:'5 апр.',color:'#F3F6F2'},
];
const filters=['Все','Идеи','Работа','Личное','Учёба','Мечты','Чтение'];
export default function Notes(){
 const [notes,setNotes]=usePersistentState('notes', seed),[filter,setFilter]=useState('Все'),[adding,setAdding]=useState(false),[draft,setDraft]=useState(''),[selected,setSelected]=useState(null);
 const add=()=>{if(draft.trim()){setNotes(n=>[{title:draft.trim(),body:'',tag:'Личное',date:'Сегодня',color:'#F8F5FA'},...n]);setDraft('');setAdding(false)}};
 return <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}><View style={s.header}><Text style={s.title}>Заметки</Text><Pressable style={s.plus} onPress={()=>setAdding(!adding)}><Feather name={adding?'x':'plus'} size={22} color={ink}/></Pressable></View>
 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{filters.map(f=><Pressable key={f} style={[s.filter,filter===f&&s.filterOn]} onPress={()=>setFilter(f)}><Text style={[s.filterText,filter===f&&{color:'white'}]}>{f}</Text></Pressable>)}</ScrollView>
 {adding?<View style={s.editor}><TextInput autoFocus value={draft} onChangeText={setDraft} onSubmitEditing={add} placeholder="Название новой заметки" style={s.editorInput}/><Pressable onPress={add} style={s.save}><Text style={{color:'white',fontWeight:'600'}}>Сохранить</Text></Pressable></View>:null}
 {selected!==null?<View style={s.editor}><Text style={s.cardTitle}>{notes[selected]?.title}</Text><TextInput multiline value={notes[selected]?.body||''} onChangeText={v=>setNotes(n=>n.map((x,i)=>i===selected?{...x,body:v}:x))} placeholder="Запиши мысль..." style={[s.editorInput,{minHeight:120,textAlignVertical:'top'}]}/><Pressable onPress={()=>setSelected(null)}><Text style={{color:sage}}>Готово</Text></Pressable></View>:null}
 <View style={s.grid}>{notes.map((n,i)=>filter==='Все'||n.tag===filter?<Pressable key={i} style={[s.card,{backgroundColor:n.color}]} onPress={()=>setSelected(i)}>{n.picture?<Image source={require('../assets/landscape.png')} style={s.picture}/>:null}<View style={s.cardContent}>{n.tag==='Чтение'?<Feather name="book-open" size={17} color="#C78D63"/>:null}<Text style={s.cardTitle}>{n.title}</Text><Text style={s.cardBody}>{n.body}</Text><View style={s.cardFoot}><Text style={s.date}>{n.date}</Text><View style={s.tag}><Text style={s.tagText}>#{n.tag.toLowerCase()}</Text></View></View></View></Pressable>:null)}</View>
 </ScrollView>
}
const s=StyleSheet.create({page:{paddingHorizontal:18,paddingTop:21,paddingBottom:120,backgroundColor:'#FFFEFC'},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:20},title:{fontSize:30,fontWeight:'700',color:ink,letterSpacing:-.7},plus:{width:42,height:42,borderRadius:21,backgroundColor:'#F1F2F2',alignItems:'center',justifyContent:'center'},filters:{gap:6,paddingBottom:14},filter:{backgroundColor:'#F3F3F2',paddingHorizontal:13,paddingVertical:8,borderRadius:17},filterOn:{backgroundColor:sage},filterText:{fontSize:12,color:ink},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},card:{width:'48.5%',minHeight:168,borderWidth:1,borderColor:'#EDEAE7',borderRadius:15,overflow:'hidden',marginBottom:9},cardContent:{padding:11,flex:1},picture:{width:'100%',height:76},cardTitle:{fontSize:14,fontWeight:'600',color:ink,lineHeight:19,marginBottom:9},cardBody:{fontSize:12,color:ink,lineHeight:19,flex:1},cardFoot:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:13},date:{fontSize:10,color:muted},tag:{backgroundColor:'#E9EFF6',borderRadius:12,paddingHorizontal:7,paddingVertical:4},tagText:{fontSize:10,color:'#526B87'},editor:{backgroundColor:'#fff',borderWidth:1,borderColor:'#EDEAE7',borderRadius:15,padding:13,marginBottom:12},editorInput:{color:ink,fontSize:14,minHeight:46},save:{alignSelf:'flex-end',backgroundColor:sage,borderRadius:11,paddingHorizontal:16,paddingVertical:9}});
