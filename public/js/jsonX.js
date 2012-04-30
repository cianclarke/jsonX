 $(document).ready(init);



function init(){
  $('.type').on('click', function(){
    var type = $(this).text().split(' ')[0];
    type = type.toLowerCase();
    $('input[name=type]').val(type);
  });
}