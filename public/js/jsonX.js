 $(document).ready(init);



function init(){
  $('#navbar').scrollspy()
  $('.type').on('click', function(){
    var type = $(this).text().split(' ')[0];
    type = type.toLowerCase();
    $('input[name=type]').val(type);
  });
  prettyPrint();
}